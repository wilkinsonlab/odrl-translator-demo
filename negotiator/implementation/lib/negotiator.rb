require 'linkeddata'

offer = ARGV[0] || "https://wilkinsonlab.github.io/odrl-translator-demo/policies/offer.jsonld"

graph = RDF::Graph.load(offer)

soffer = ""

query = SPARQL.parse("select DISTINCT ?s where {?s a <http://www.w3.org/ns/odrl/2/Offer>}")
r = query.execute(graph)
r.each do |r|
    puts "Found offer: #{r[:s].to_s}"
    soffer = r[:s].to_s
end

query = SPARQL.parse("select DISTINCT ?p where {?s a <#{soffer}>}")
r = query.execute(graph)
r.each do |r|
    puts "Found offer: #{r[:s].to_s}"
    soffer = r[:s].to_s
end
