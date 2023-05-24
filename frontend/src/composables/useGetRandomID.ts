export default function useGetRandomID() {
  return crypto.getRandomValues(new Uint32Array(1)).at(0)!;
}
