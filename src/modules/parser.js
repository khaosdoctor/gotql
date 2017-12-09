function parse (query, type) {
  let finalQuery = `${type.toString()}`
  finalQuery.concat(query.name || '', ' {') // Append query name if the name is present
  finalQuery.concat(query.operation) // Append operation name

  return finalQuery
}

module.exports = { parse }
