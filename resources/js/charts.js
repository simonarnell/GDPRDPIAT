export class Chart {
  constructor(config, data) {
    this.config = config
    this.data = data
    return this
  }

  generateXScale(accessor) {
    this.xScale = d3.scaleBand()
      .domain(this.data.responseSet.choices.map(accessor))
      .range([this.config.margin.left, this.config.width - this.config.margin.right])
      .paddingOuter(this.config.padding.outer)
      .paddingInner(this.config.padding.inner)
  }

  generateXLabels() {
    d3.select(`#${this.data.name}`)
      .append('svg')
        .attr('viewBox', [0, 0, this.config.width, this.config.height])
      .append('g').attr('class', 'x ticks')
        .call(d3.axisBottom(this.xScale))
      .selectAll('.tick text')
        .call(this.wrap, this.xScale.bandwidth())
    this.config.margin.bottom += d3.max(d3.select(`#${this.data.name}`).selectAll('.tick text').nodes(), (text) => text.getBBox().height)
  }

  wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1,
          y = text.attr('y'),
          dy = parseFloat(text.attr('dy')),
          tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy +'em').text(word);
        }
      }
    });
  }
}

export class BarChart extends Chart {
  constructor(config, data) {
    super(config, data)
    this.generateXScale(d => Object.keys(d)[0])
    this.generateXLabels()
    this.yScale = d3.scaleLinear()
      .domain([0, this.data.responseSet.choices.reduce((acc, choice) => Object.values(choice)[0] > acc ? Object.values(choice)[0] : acc, 0)]).nice()
      .range([this.config.height - this.config.margin.bottom, this.config.margin.top])
    d3.select(`#${this.data.name}`)
      .select('svg')
      .call(svg => svg
        .append('g')
        .attr('class', 'axes')
          .call(g => g
            .append('g')
            .attr('class', 'axis x')
            .attr('transform', `translate(0, ${this.config.height - this.config.margin.bottom})`)
            .append(() => d3.select(`#${this.data.name}`).select('.x.ticks').remove().node()))
          .call(g => g
            .append('g')
            .attr('class', 'axis y')
            .attr('transform', `translate(${this.config.margin.left}, 0)`)
            .append('g').attr('class', 'y ticks').call(d3.axisLeft(this.yScale))))
      .call(svg => svg
        .append('g')
        .attr('class', 'responses')
          .selectAll('rect')
          .data(this.data.responseSet.choices)
          .join('rect')
          .attr('class', 'response')
          .attr('width', this.xScale.bandwidth())
          .attr('height', d => this.yScale.range()[0] - this.yScale(Object.values(d)[0]))
          .attr('x', d => this.xScale(Object.keys(d)[0]))
          .attr('y', d => this.yScale(Object.values(d)[0])))
    return this
  }
}

export class StackedBarChart extends Chart {
  constructor(config, data) {
    super(config, data)

    this.generateXScale(d => Object.values(d)[0])
    this.generateXLabels()

    let keys = [...new Set(this.data.responseSet.choices.map(({ question, ...responses}) => { return { ...responses }})
      .reduce((acc, responses) => acc = acc.concat(Object.keys(responses)),[]))]

    this.colour = d3.scaleOrdinal()
    .domain(keys.map((d, i)=> i))
    .range(['#003399','#ffcc00'])

    d3.select(`#${this.data.name}`).select('svg')
      .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${this.config.width - this.config.margin.right - this.config.legend.width}, ${this.config.margin.top})`)
      .selectAll('g')
      .data(this.colour.domain())
      .join('g')
        .attr('transform', (d, i, arr) => `translate(${i * this.config.legend.width / arr.length}, 0)`)
      .call(g => g
        .append('rect')
          .attr('class', 'legend swatch')
          .attr('height', this.config.legend.height)
          .attr('width', (d, i, arr) => this.config.legend.width / arr.length)
          .style('fill', d => this.colour(d)))
      .call(g => g
        .append('text')
          .attr('transform', `translate(0, ${this.config.legend.height})`)
          .attr('class', 'legend label')
          .attr('x', (d, i, arr) => this.config.legend.width / arr.length / 2)
          .attr('y', '1em')
          .text(d => keys[d]))

    this.config.margin.top += d3.select('.legend').node().getBBox().height

    let stack = d3.stack()
      .keys(keys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    let series = stack(this.data.responseSet.choices);

    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
      .range([this.config.height - this.config.margin.bottom, this.config.margin.top])

    d3.select(`#${this.data.name}`)
      .select('svg')
      .call(svg => svg
        .append('g')
        .attr('class', 'axes')
          .call(g => g
            .append('g')
            .attr('class', 'axis x')
            .attr('transform', `translate(0, ${this.config.height - this.config.margin.bottom})`)
            .append(() => d3.select(`#${this.data.name}`).select('.x.ticks').remove().node()))
          .call(g => g
            .append('g')
            .attr('class', 'axis y')
            .attr('transform', `translate(${this.config.margin.left}, 0)`)
            .append('g').attr('class', 'y ticks').call(d3.axisLeft(this.yScale))))
      .call(svg => svg
        .append('g')
        .selectAll('g')
        .data(series)
        .join('g')
        .style('fill', (d, i) => this.colour(i))
        .selectAll('rect')
        .data(d => d)
        .join('rect')
          .attr('x', (d, i) => this.xScale(this.data.responseSet.choices[i].question))
          .attr('y', d => this.yScale(d[1]))
          .attr('height', d => this.yScale(d[0]) - this.yScale(d[1]))
          .attr('width', this.xScale.bandwidth()))
    return this
  }
}
