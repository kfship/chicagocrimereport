class HeatMap {

    constructor(crimeData, crimeCountChart, crimeTypeChart1, crimeTypeChart2, width = 440, height = 600, leftMargin = 50) {

        this.crimeData = crimeData;
        this.width = width;
        this.height = height;
        this.leftMargin = leftMargin;       

        this.selectedArea = [];
        this.crimeCountChart = crimeCountChart;
        this.crimeTypeChart1 = crimeTypeChart1;
        this.crimeTypeChart2 = crimeTypeChart2;
    }

    initialize() {

        const projection = d3.geoMercator()
            .center([-87.623177, 41.881832])
            .scale(50000)
            .translate([this.width / 2 + this.leftMargin, this.height / 2]);

        const path = d3.geoPath().projection(projection);

        const svg = d3.select("#map")
            .append("svg")
            .attr("width", this.width + this.leftMargin)
            .attr("height", this.height)
            .append("g")
            .attr("transform", `translate(${this.leftMargin}, 0)`);

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    
        const color = d3.scaleQuantize()
            .range(d3.schemeReds[9]);

        const publicData = this.crimeData;
        const mapHeight = this.height;

        let selectedNeighborhoods = this.selectedArea;
        let barChart = this.crimeCountChart;
        let pieChart1 = this.crimeTypeChart1;
        let pieChart2 = this.crimeTypeChart2;

        d3.select("#spinner-container").style("display", "block");        

        d3.json("chicago.geojson").then(function(data) {
            
            const neighborhoodStats = {};

            data.features.forEach(feature => {
                const neighborhood = feature.properties.pri_neigh;
                neighborhoodStats[neighborhood] = {
                    crimeCount: 0,
                    monthCount: new Array(12).fill(0),
                    amCount: 0,
                    pmCount: 0,
                    crimeTypes: {}
                };
            });

            publicData.forEach(crime => {

                data.features.forEach(feature => {

                    if (d3.geoContains(feature, [crime.longitude, crime.latitude])) {

                        const neighborhood = feature.properties.pri_neigh;
                        neighborhoodStats[neighborhood].crimeCount++;

                        const month = crime.date.getMonth();
                        neighborhoodStats[neighborhood].monthCount[month]++;

                        const hours = crime.date.getHours();
                        if (hours < 12) {
                            neighborhoodStats[neighborhood].amCount++;
                        } else {
                            neighborhoodStats[neighborhood].pmCount++;
                        }

                        const crimeType = crime["PRIMARY DESCRIPTION"];
                        if (!neighborhoodStats[neighborhood].crimeTypes[crimeType]) {
                            neighborhoodStats[neighborhood].crimeTypes[crimeType] = 0;
                        }
                        neighborhoodStats[neighborhood].crimeTypes[crimeType]++;
                    }
                });
            });

            const crimeCounts = Object.values(neighborhoodStats).map(d => d.crimeCount);
            color.domain([0, d3.max(crimeCounts)]);

            svg.selectAll("path")
                .data(data.features)
                .enter()
                .append("path")
                .attr("class", "neighborhood")
                .attr("d", path)
                .attr("fill", d => color(0))
                .transition()
                .duration(2000)
                .attr("fill", d => color(neighborhoodStats[d.properties.pri_neigh].crimeCount));

            svg.selectAll("path")
                .on("mouseover", function(event, d) {

                    const neighborhood = d.properties.pri_neigh;
                    const stats = neighborhoodStats[neighborhood];

                    tooltip.transition().duration(200).style("opacity", .9);

                    tooltip.html(`${neighborhood}<br/>Crimes: ${stats.crimeCount}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {

                    tooltip.transition().duration(500).style("opacity", 0);
                })
                .on("click", function(event, d) {

                    const neighborhood = d.properties.pri_neigh;
                    if (selectedNeighborhoods.includes(neighborhood)) {
                        selectedNeighborhoods = selectedNeighborhoods.filter(n => n !== neighborhood);
                    } else {
                        selectedNeighborhoods.push(neighborhood);
                        if (selectedNeighborhoods.length > 2) {
                            selectedNeighborhoods = selectedNeighborhoods.slice(1);
                        }
                    }

                    d3.selectAll(".neighborhood").classed("highlight", false);
                    selectedNeighborhoods.forEach(n => {
                        d3.selectAll("path")
                            .filter(d => d && d.properties && d.properties.pri_neigh === n)
                            .classed("highlight", true);
                    });

                    if (selectedNeighborhoods.length === 2) {
                        barChart.update(selectedNeighborhoods, neighborhoodStats);
                        pieChart1.update(selectedNeighborhoods[0], neighborhoodStats);
                        pieChart2.update(selectedNeighborhoods[1], neighborhoodStats);
                    } else if (selectedNeighborhoods.length === 1) {
                        barChart.update([], neighborhoodStats);
                        pieChart1.update(selectedNeighborhoods[0], neighborhoodStats);
                        pieChart2.update(null, neighborhoodStats);
                    } else {
                        barChart.update([], neighborhoodStats);
                        pieChart1.update(null, neighborhoodStats);
                        pieChart2.update(null, neighborhoodStats);
                    }
                });
            
            // 빈 차트 생성
            barChart.update([], neighborhoodStats);
            pieChart1.update(null, neighborhoodStats);
            pieChart2.update(null, neighborhoodStats);

            d3.select(".spinner-container").style("display", "none");
            d3.select("#map").style("display", "block");

            const legend = d3.legendColor()
                .labelFormat(d3.format(".0f"))
                .scale(color)
                .title("Crime Count")
                .shapeHeight(20)
                .shapeWidth(20)
                .shapePadding(0)
                .labelOffset(15);

            svg.append("g")
                .attr("class", "legendQuant")
                .attr("transform", `translate(20, ${mapHeight - 200})`);

            svg.select(".legendQuant")
                .call(legend);
        })

        this.selectedArea = selectedNeighborhoods;
    }
}