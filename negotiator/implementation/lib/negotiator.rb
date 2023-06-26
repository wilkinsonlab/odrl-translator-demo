require 'linkeddata'

offer = ARGV[0]

graph = RDF::Graph.load(offer)
query = SPARQL.parse("select DISTINCT ?s ?type where {?s a ?type}")
r = query.execute(graph)
r.results.each do |r|
    puts r[:type]
end
