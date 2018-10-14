import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

// add svg 

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// set projections 

let projection = d3.geoMercator()
let graticule = d3.geoGraticule()

let path = d3.geoPath().projection(projection)

// scales 

let colorScale = d3
  .scaleSequential(d3.interpolateCool)
  .domain([0, 600000])
  .clamp(true)
  
// read in data 

  Promise.all([
    d3.json(require('./data/world.topojson')),
    d3.csv(require('./data/world-cities.csv'))
  ])

  .then(ready)
  .catch(err => console.log('Failed on', err))


function ready([json, datapoints]) {

// console.log(json.objects)
// console.log(cities)

let countries = topojson.feature(json, json.objects.countries)

// add map

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'black')
    .attr('stroke', 'black')


// add grid 

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'gray')
    .attr('fill', 'none')
    .lower()

// add black background 

  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'black')
    .lower()

// add cities (circles)

  svg
    .selectAll('.cities')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'cities')
    .attr('r', 1)
    .attr('fill', d => colorScale(d.population))
    .attr('transform', d => {
      //console.log(d)
     let coords = projection([d.lng, d.lat])
     return `translate(${coords})`
    })

  }
