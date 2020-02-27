
class LineScent {
  constructor(element_selector) {
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.width = $(element_selector).parent().width() - margin.left - margin.right;
    // this.height = $(element_selector).parent().height() - margin.top - margin.bottom;
    this.height = 40 - margin.top - margin.bottom;
  
    let full_width = this.width + this.margin.left + this.margin.right;
    let full_height = this.height + this.margin.top + this.margin.bottom;

    this.svg = d3.select(element_selector).insert("svg",":first-child")

      .attr('viewbox', `0 0 ${full_width} ${full_height}`)
      .style('width', '100%')
      .style('position', 'absolute')
      .style('z-index', 1)
      .style('top', -1)
      .style('left', 0)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.xScale = d3.scaleLinear()
      .range([0, this.width]);
    this.yScale = d3.scaleLinear()
      .range([0, this.height]); // output
    this.line = d3.line();
  }
  load_data(data) {
    // this.data = data;

    // temp
    var n = 21; 
    this.data = d3.range(n).map(function (d) { return { "y": d3.randomUniform(1)() } })
    this.xScale.domain([0, n - 1])
    this.yScale.domain([0, 1]) // input 
    this.line
      .x((d, i) => this.xScale(i)) // set the x values for the line generator
      .y((d) => this.yScale(d.y)) // set the y values for the line generator 
      .curve(d3.curveMonotoneX) // apply smoothing to the line
  }
  draw() {
    // Axis not needed in scent
    // scent_date_svg.append("g")
    //   .attr("class", "x axis")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    // // 4. Call the y axis in a group tag
    // scent_date_svg.append("g")
    //   .attr("class", "y axis")
    //   .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
    let that = this;
    this.svg.append("path")
    .datum(that.data) // 10. Binds data to the line 
    .attr("class", "line") // Assign a class for styling 
    .attr("d", that.line) // 11. Calls the line generator 
    .style('fill', 'darkblue')
    .style('stroke', 'red')
    .style('stroke-width', 0);
  }
  resize(){
    // Place resize code here
  }
  // 12. Appends a circle for each datapoint 
  // scent_date_svg.selectAll(".dot")
  //   .data(dataset)
  //   .enter().append("circle") // Uses the enter().append() method
  //   .attr("class", "dot") // Assign a class for styling
  //   .attr("cx", function (d, i) { return xScale(i) })
  //   .attr("cy", function (d) { return yScale(d.y) })
  //   .attr("r", 5)
  //   .on("mouseover", function (a, b, c) {
  //     console.log(a)
  //     this.attr('class', 'focus')
  //   })
  //   .on("mouseout", function () { })
}