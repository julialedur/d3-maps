import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4b')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// set projections

let projection = d3.geoAlbers()
let graticule = d3.geoGraticule()

let path = d3.geoPath().projection(projection)

// scales

let colorScale = d3.scaleLinear().range(['#8E0152', '#276419'])

let opacityScale = d3
  .scaleLinear()
  .domain([0, 80000])
  .range([0, 1])
  .clamp(true)

// read in data

Promise.all([
  d3.json(require('./data/counties_with_election_data.topojson'))
  // d3.csv(require('./data/world-cities.csv'))
])

  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  // console.log(json[0].objects)

  let counties = topojson.feature(json[0], json[0].objects.us_counties)
  // console.log(counties)

  // add map

  svg
    .selectAll('.counties')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('fill', 'white')
    .attr('stroke', 'none')
    .attr('fill', d => {
      // console.log(d.properties)
      let totalVotes = d.properties.clinton + d.properties.trump
      let clintonVotes = d.properties.clinton
      let trumpVotes = d.properties.trump
      if (clintonVotes > trumpVotes) {
        return '#8E0152'
      }
      if (trumpVotes > clintonVotes) {
        return '#276419'
      }
      if (!d.properties.state === 'Maine') {
        return 'lightgray'
      }
    })
    .attr('opacity', function(d) {
      if (d.properties.state) {
        let totalVotes = d.properties.clinton + d.properties.trump
        return opacityScale(totalVotes)
      }
      return 0.2
    })
}
