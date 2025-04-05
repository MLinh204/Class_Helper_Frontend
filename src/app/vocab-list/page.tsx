'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavigationBar from "@/components/NavigationBar";
import VocabListCard from "@/components/vocabListCard";
import { getAllVocabLists, searchVocabList } from "@/utils/api";

interface VocabList {
  id: number;
  title: string;
  description: string;
  category: string;
  word_count: number;
  created_at: string;
}

const VocabListPage = () => {
  const router = useRouter();
  const [vocabLists, setVocabLists] = useState<VocabList[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVocabList = async () => {
    try {
      setLoading(true);
      const res = await getAllVocabLists();
      setVocabLists(res.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching vocabulary lists:", error);
      setError("Failed to load vocabulary lists. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchVocabList();
  }, [router]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await searchVocabList(searchQuery);
      if (res.data.length === 0) {
        setError("No vocabulary lists found matching the query.");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Error searching vocabulary lists:", err);
      setError("An error occurred while searching for vocabulary lists.");
    }
  };

  const filteredVocabLists = vocabLists.filter(vocabList =>
    vocabList.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vocabList.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Vocabulary Lists</h1>
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              placeholder="Search vocabulary lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </form>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-lg font-semibold text-center my-8">
            {error}
          </div>
        ) : filteredVocabLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVocabLists.map((vocab) => (
              <VocabListCard key={vocab.id} vocab={vocab} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center my-16 text-lg">
            {searchQuery ? 'No vocabulary lists match your search' : 'No vocabulary lists available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabListPage;
