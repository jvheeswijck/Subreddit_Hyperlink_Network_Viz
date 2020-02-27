
class LineScent {
  constructor(element_selector) {
    this.element_selector = element_selector
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.width = $(element_selector).parent().width() - margin.left - margin.right;
    // this.height = $(element_selector).parent().height() - margin.top - margin.bottom;
    this.height = 40 - margin.top - margin.bottom;

    let full_width = this.width + this.margin.left + this.margin.right;
    let full_height = this.height + this.margin.top + this.margin.bottom;

    this.svg = d3.select(element_selector).insert("svg", ":first-child")
      .attr('viewbox', `0 0 ${full_width} ${full_height}`)
      .style('width', 'calc(100% + 2px)')
      .style('position', 'absolute')
      .style('z-index', 1)
      .style('top', -1)
      .style('left', -1)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.xScale = d3.scaleLinear()
      .range([0, this.width]);
    this.yScale = d3.scaleLinear()
      .range([0, (this.height / 2 - 1)]); // output
    this.neg_line = d3.line();
    this.pos_line = d3.line();

    new ResizeObserver(this.resize.bind(this)).observe($(element_selector)[0]);
  }
  load_data(data) {
    // this.data = data;

    // temp
    var n = 21;
    this.data1 = d3.range(n).map(function (d) { return { "y": d3.randomUniform(1)() } });
    this.data2 = d3.range(n).map(function (d) { return { "y": d3.randomUniform(1)() } })
    this.xScale.domain([0, n - 1])
    this.yScale.domain([0, 1]) // input 
    // this.pos_line
    //   .x((d, i) => this.xScale(i)) // set the x values for the line generator
    //   .y((d) => 0.5*this.height - this.yScale(d.y)) // set the y values for the line generator 
    //   .curve(d3.curveMonotoneX) // apply smoothing to the line

    this.pos_area = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d, i) => this.xScale(i))
      .y0(this.height * 0.5)
      .y1((d) => 0.5*this.height - this.yScale(d.y));
    this.neg_area = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d, i) => this.xScale(i))
      .y0(0.5*this.height)
      .y1((d) => this.yScale(d.y) + 0.5*this.height);

    // this.neg_line
    //   .x((d, i) => this.xScale(i)) // set the x values for the line generator
    //   .y((d) => 0.5 * this.height + this.yScale(d.y)) // set the y values for the line generator 
    //   .curve(d3.curveMonotoneX) // apply smoothing to the line
  }
  draw() {
    // Top line
    let that = this;
    this.svg.html("")
    // .append("path")
    // .attr('id', 'negative-line')
    // .datum(that.data1) // 10. Binds data to the line 
    // .attr("class", "line") // Assign a class for styling 
    // .attr("d", that.pos_line) // 11. Calls the line generator 
    // .style('fill', 'none')
    // .style('stroke', 'blue')
    // .style('stroke-width', 1);

    this.svg
      .append("path")
      .datum(this.data1)
      .attr('id', 'pos-fill')
      .attr('d', this.pos_area)
      .style('fill', '#7a99c5')

    this.svg
      .append("path")
      .datum(this.data2)
      .attr('id', 'neg-fill')
      .attr('d', this.neg_area)
      .style('fill', '#f03333')

    // Bottom Line
    // this.svg
    //   .append("path")
    //   .attr('id', 'positive-line')
    //   .datum(that.data2) // 10. Binds data to the line 
    //   .attr("class", "line") // Assign a class for styling 
    //   .attr("d", that.neg_line) // 11. Calls the line generator 
    //   .style('fill', 'none')
    //   .style('stroke', 'red')
    //   .style('stroke-width', 1);
  }

  resize() {
    this.setScales();
    this.draw();
  }

  setScales() {
    this.width = $(this.element_selector).parent().width() - margin.left - margin.right;
    this.height = 40 - margin.top - margin.bottom;

    this.xScale.range([0, this.width])
    this.yScale.range([0, this.height / 2 - 1]) // input
    this.pos_line
      .x((d, i) => this.xScale(i)) // set the x values for the line generator
      .y((d) => 0.5 * this.height - this.yScale(d.y)) // set the y values for the line generator 
      .curve(d3.curveMonotoneX) //
    this.neg_line
      .x((d, i) => this.xScale(i)) // set the x values for the line generator
      .y((d) => 0.5 * this.height + this.yScale(d.y)) // set the y values for the line generator 
      .curve(d3.curveMonotoneX) //
  }
}