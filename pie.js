class PieChart {

    constructor(width = 180, height = 180) {

        this.width = width;
        this.height = height;
    }

    initialize(divChartId) {

        this.radius = Math.min(this.width, this.height) / 2;
        this.div = d3.select(divChartId);      
    }

    update(neighborhood, stats) {

        const crimeTypes = neighborhood ? stats[neighborhood].crimeTypes : {};

        const data = Object.entries(crimeTypes).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count).slice(0, 10);

        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.type))
            .range(d3.schemeCategory10);

        const svg = this.div
            .html("")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height + 120) 
            .append("g")
            .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

        const pie = d3.pie()
            .value(d => d.count);

        const arc = d3.arc()
            .outerRadius(this.radius - 10)
            .innerRadius(0);

        const arcOver = d3.arc()
            .outerRadius(this.radius - 5)
            .innerRadius(0);

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        const g = svg.selectAll(".arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc");
            
        g.append("path")
            .attr("d", arc)
            .each(function(d) { this._current = d; }) 
            .style("fill", d => color(d.data.type))
            .transition()
            .duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

        g.on("mouseover", function(event, d) {
                d3.select(this).select("path").transition()
                    .duration(200)
                    .attr("d", arcOver);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                tooltip.html(`${d.data.type}<br/>Count: ${d.data.count}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).select("path").transition()
                    .duration(200)
                    .attr("d", arc);

                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        g.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("fill", "#fff")
            .text(d => d.data.count);


        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${-this.width / 2}, ${this.radius + 40})`);

        const legendItem = legend.selectAll(".legend-item")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItem.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => color(d.type));

        legendItem.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(d => d.type);

        svg.append("text")
            .attr("x", 0)
            .attr("y", this.radius + 20)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .text(neighborhood || "No Data");
    }
}
