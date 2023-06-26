require 'linkeddata'

offer = ARGV[0] || "https://wilkinsonlab.github.io/odrl-translator-demo/policies/offer-biohackathon.jsonld"

graph = RDF::Graph.load(offer)
query = SPARQL.parse("select DISTINCT ?s ?type where {?s a ?type}")
r = query.execute(graph)
r.each do |r|
    puts r[:type]
end
