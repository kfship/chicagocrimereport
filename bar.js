class BarChart {

    margin = {
        top: 100, right: 30, bottom: 20, left: 40
    }

    constructor(width = 400, secWidth = 250, height = 250) {

        this.width = width;
        this.height = height;
        this.secWidth = secWidth;
    }

    initialize(divChartId) {

        this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        this.times = ["AM", "PM"];
        this.chartWidth = this.width - this.margin.left - this.margin.right;
        this.chartHeight = this.height - this.margin.top - this.margin.bottom;
        this.secondChartWidth = this.secWidth - this.margin.left - this.margin.right;
        
        this.div = d3.select(divChartId);
    }

    update(neighborhoods, stats) {
        
        const data = neighborhoods.map(n => stats[n].monthCount);
        const timeData = neighborhoods.map(n => [stats[n].amCount, stats[n].pmCount]);

        const svg = this.div
            .html("")
            .append("svg")
            .attr("width", (this.chartWidth + this.secondChartWidth + this.margin.left + this.margin.right * 3 - 30))
            .attr("height", this.chartHeight + this.margin.top + this.margin.bottom * 2 + 40)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        
        const x0 = d3.scaleBand()
            .domain(this.months)
            .range([0, this.chartWidth])
            .padding(0.1);

        const x1 = d3.scaleBand()
            .domain([0, 1])
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data.flat())])
            .nice()
            .range([this.chartHeight, 0]);

        const tickValues1 = y.ticks().filter(tick => tick % 2 === 0); 
        
        const color = d3.scaleOrdinal()
            .domain([0, 1])
            .range(["#1f77b4", "#ff7f0e"]);

        const chart1 = svg.append("g");

        chart1.selectAll("g")
            .data(d3.transpose(data))
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${x0(this.months[i])},0)`)
            .selectAll("rect")
            .data((d, i) => d.map((value, j) => ({ key: j, value: value })))
            .enter().append("rect")
            .attr("x", d => x1(d.key))
            .attr("width", x1.bandwidth())
            .attr("y", y(0))
            .attr("height", 0)
            .transition()
            .duration(1000)
            .attr("y", d => y(d.value))
            .attr("height", d => this.chartHeight - y(d.value))
            .attr("fill", d => color(d.key));

        chart1.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${this.chartHeight})`)
            .call(d3.axisBottom(x0));

        chart1.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).tickValues(tickValues1).tickFormat(d3.format("d")));

        const legendOrdinal1 = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
            .shapePadding(5)
            .scale(color)
            .labels(neighborhoods);

        svg.append("g")
            .attr("class", "legendOrdinal1")
            .attr("transform", `translate(0, ${this.chartHeight + 40})`)
            .call(legendOrdinal1);

        svg.selectAll(".legendOrdinal1 .cell")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);
    
        const chart2 = svg.append("g")
            .attr("transform", `translate(${this.chartWidth + this.margin.left + this.margin.right * 2 - 30}, 0)`);

        const x2 = d3.scaleBand()
            .domain(this.times)
            .range([0, this.secondChartWidth])
            .paddingInner(0.2)
            .paddingOuter(0.4);

        const x3 = d3.scaleBand()
            .domain([0, 1])
            .range([-x2.bandwidth() / 4, x2.bandwidth() / 4])
            .padding(0.1);

        const y2 = d3.scaleLinear()
            .domain([0, d3.max(timeData.flat())])
            .nice()
            .range([this.chartHeight, 0]);

        const tickValues2 = y2.ticks().filter(tick => tick % 2 === 0);

        chart2.selectAll("g")
            .data(d3.transpose(timeData))
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${x2(this.times[i]) + 34},0)`)
            .selectAll("rect")
            .data((d, i) => d.map((value, j) => ({ key: j, value: value })))
            .enter().append("rect")
            .attr("x", d => x3(d.key))
            .attr("width", x3.bandwidth())
            .attr("y", y2(0))
            .attr("height", 0)
            .transition()
            .duration(1000)
            .attr("y", d => y2(d.value))
            .attr("height", d => this.chartHeight - y2(d.value))
            .attr("fill", d => color(d.key));


        chart2.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${this.chartHeight})`)
            .call(d3.axisBottom(x2));

        chart2.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y2).tickValues(tickValues2).tickFormat(d3.format("d")));

        // 두 번째 차트 범례
        const legendOrdinal2 = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
            .shapePadding(5)
            .scale(color)
            .labels(neighborhoods);

        svg.append("g")
            .attr("class", "legendOrdinal2")
            .attr("transform", `translate(${this.chartWidth +this.margin.left * 2 + this.margin.right * 2 - 65}, ${this.chartHeight + 40})`) // 두 번째 차트 아래에 배치하고 왼쪽으로 35 이동
            .call(legendOrdinal2);

        // 범례 항목을 세로로 정렬
        svg.selectAll(".legendOrdinal2 .cell")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);
    }
}