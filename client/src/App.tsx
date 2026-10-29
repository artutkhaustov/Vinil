import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchBar } from './features/search/SearchBar';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchBar />
    </QueryClientProvider>
  );
}