import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 200 - margin.top - margin.bottom
let width = 300 - margin.left - margin.right

let container = d3.select('#chart-6')

// set projections

let projection = d3.geoAlbersUsa()
// let graticule = d3.geoGraticule()

let path = d3.geoPath().projection(projection)

// scales

let radiusScale = d3
  .scaleSqrt()
  .domain([0, 50])
  .range([0, 1])

var yPositionScale = d3.scaleBand().range([100, 500])

let colorScale = d3
  .scaleOrdinal()
  .domain([
    'hydroelectric',
    'coal',
    'natural gas',
    'nuclear',
    'petroleum',
    'pumped storage',
    'geothermal',
    'biomass',
    'wind',
    'other',
    'solar'
  ])
  .range([
    '#EC923F',
    '#99979A',
    '#C1619B',
    '#2A83C2',
    '#DE473A',
    '#51A74C',
    '#D6C54E',
    '#FDEED6',
    '#EC923F',
    '#99979A',
    '#C1619B'
  ])

// read in data

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])

  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, powerplants]) {
  // console.log(json)
  let states = topojson.feature(json, json.objects.us_states)
  // console.log(states)

  projection.fitSize([width, height], states)

  // set yPositionScale

  let powerplantTypes = powerplants.map(d => d.PrimSource)

  let types = d3.set(powerplantTypes).values()
  yPositionScale.domain(types)
  colorScale.domain(powerplantTypes)

  // nested data

  var nested = d3
    .nest()
    .key(d => d.PrimSource)
    .entries(powerplants)

  // add one svg for each graph

  container
    .selectAll('source-graphs')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      var svg = d3.select(this)
      var powerplants = d.values

      projection.fitSize([width, height], states)

      // add maps

      svg
        .selectAll('.states')
        .data(states.features)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('fill', '#E1E1E1')
        .attr('stroke', 'none')

      // add powerplant bubbles

      svg
        .selectAll('.powerplants')
        .data(powerplants)
        .enter()
        .append('circle')
        .attr('class', 'powerplant')
        .attr('r', d => radiusScale(d.Total_MW))
        .attr('fill', d => colorScale(d.PrimSource))
        .attr('opacity', 0.6)
        .attr('transform', d => {
          // console.log(d)
          var coords = [d.Longitude, d.Latitude]
          // console.log(coords)
          return `translate(${projection(coords)})` // this is how you convert lat/long to pixels
        })

      // source labels

      svg
        .append('text')
        .text(d.key)
        .attr('font-weight', '600')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
    })

  // let legend = svg.append('g').attr('transform', 'translate(50, 50)')

  // legend
  //   .selectAll('.legend-entry')
  //   .data(nested)
  //   .enter()
  //   .append('g')
  //   .attr('y', 50)
  //   .attr('transform', (d, i) => `translate(-150,${i * 20})`)
  //   .attr('class', 'legend-entry')
  //   .each(function(d) {
  //     let g = d3.select(this)

  //     g.append('circle')
  //       .attr('r', 5)
  //       .attr('cx', 0)
  //       .attr('cy', 0)
  //       .attr('fill', colorScale(d.key))

  //     g.append('text')
  //       .text(d.key.charAt(0).toUpperCase() + d.key.slice(1)) // to capitalize the first letter
  //       .attr('dx', 10)
  //       .attr('fill', 'black')
  //       .attr('alignment-baseline', 'middle')
  // })
}
