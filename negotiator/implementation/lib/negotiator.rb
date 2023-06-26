require 'linkeddata'

offer = ARGV[0] || "https://wilkinsonlab.github.io/odrl-translator-demo/policies/offer-biohackathon.jsonld"

graph = RDF::Graph.load(offer)

query = SPARQL.parse("select DISTINCT ?s where {?s a <http://www.w3.org/ns/odrl/2/Offer>}")
r = query.execute(graph)
r.each do |r|
    puts r[:s]
end
