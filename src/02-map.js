import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 20, right: 20, bottom: 0 }

let height = 400 - margin.top - margin.bottom

let width = 700 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoEqualEarth()

let graticule = d3.geoGraticule()

let path = d3.geoPath().projection(projection)

let coordinateStore = d3.map() // like a d3 dictionary that stores data

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/flights.csv')),
  d3.csv(require('./data/airport-codes-subset.csv'))
])

  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, flights, airports]) {
  airports.forEach(d => {
    let name = d.iata_code
    let coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  // console.log(airports)

  let countries = topojson.feature(json, json.objects.countries)

  projection.fitSize([width, height], countries)

  // add globe

  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', '#b3d9ff')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)

  // add countries

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', '#d9d9d9')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.3)

  // add circles for the airports

  svg
    .selectAll('.airport')
    .data(airports)
    .enter()
    .append('circle')
    .attr('class', 'airport')
    .attr('r', 2)
    .attr('fill', 'white')
    .attr('transform', d => {
      // console.log(d)
      var coords = [d.longitude, d.latitude]
      // console.log(coords)
      return `translate(${projection(coords)})` // this is how you convert lat/long to pixels
    })

  // add lines

  svg
    .selectAll('.transit')
    .data(flights)
    .enter()
    .append('path')
    .attr('d', d => {
      // What is the 'from' city?
      console.log(d.coordsJFK)

      // Pull out our coordinates
      let fromCoords = [-73.78, 40.64] // JFK coordinates
      let toCoords = coordinateStore.get(d.code)

      // Build a GeoJSON LineString
      var geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }

      // Feed that to our d3.geoPath()
      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 0.6)
    .attr('opacity', 0.8)
    .attr('stroke-linecap', 'round')
}
