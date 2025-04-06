'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '@/components/NavigationBar';
import {
  getVocabByListId,
  getVocabListById,
  getStudentById,
  searchVocabViaListId,
  createVocab,
  updateVocab
} from '@/utils/api';

interface Vocab {
  id: number;
  word: string;
  translation: string;
  definition: string;
  part_of_speech: string;
  example_sentence: string;
  synonyms: string;
  antonyms: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  student?: {
    userFullName: string;
  };
}

interface VocabList {
  id: number;
  title: string;
  description: string;
  category: string;
}

// Initial empty form values for creating a new vocab
const initialVocabForm = {
  word: '',
  translation: '',
  definition: '',
  part_of_speech: 'noun',
  example_sentence: '',
  synonyms: '',
  antonyms: ''
};

const VocabDetailPage = ({ params }: { params: Promise<{ vocabId: string }> }) => {
  // Unwrap the promise for params
  const resolvedParams = React.use(params);

  const router = useRouter();
  const [vocabList, setVocabList] = useState<VocabList | null>(null);
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState(initialVocabForm);
  const [editingVocabId, setEditingVocabId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState(initialVocabForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVocabList = async () => {
    try {
      setLoading(true);
      const listId = parseInt(resolvedParams.vocabId);
      // Fetch vocabulary list details
      const listResponse = await getVocabListById(listId);
      setVocabList(listResponse.data);

      // Fetch vocabularies for this list
      const vocabResponse = await getVocabByListId(listId);
      // For each vocab, fetch student details for creator
      const vocabsWithCreators = await Promise.all(
        vocabResponse.data.map(async (vocab: Vocab) => {
          try {
            if (vocab.created_by) {
              const studentResponse = await getStudentById(vocab.created_by);
              return { ...vocab, student: studentResponse.data };
            }
            return vocab;
          } catch (err) {
            console.error(`Error fetching student ${vocab.created_by}:`, err);
            return { ...vocab, student: { userFullName: 'Unknown' } };
          }
        })
      );
      setVocabs(vocabsWithCreators);
      setError(null);
    } catch (err) {
      console.error('Error fetching vocabulary details:', err);
      setError('Failed to load vocabulary data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchVocabList();
  }, [resolvedParams.vocabId, router]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // Reset search: fetch all vocabs
      fetchVocabList();
      return;
    }
    try {
      const listId = parseInt(resolvedParams.vocabId);
      const response = await searchVocabViaListId(listId, searchQuery);
      // For each vocab in search results, fetch student details for creator
      const vocabsWithCreators = await Promise.all(
        response.data.map(async (vocab: Vocab) => {
          try {
            if (vocab.created_by) {
              const studentResponse = await getStudentById(vocab.created_by);
              return { ...vocab, student: studentResponse.data };
            }
            return vocab;
          } catch (err) {
            console.error(`Error fetching student ${vocab.created_by}:`, err);
            return { ...vocab, student: { userFullName: 'Unknown' } };
          }
        })
      );
      setVocabs(vocabsWithCreators);
      setError(response.data.length === 0 ? 'No vocabularies found matching your search.' : null);
    } catch (err) {
      console.error('Error searching vocabularies:', err);
      setError('An error occurred while searching.');
    }
  };

  // Handle toggling the create form
  const handleCreateVocab = () => {
    setShowCreateForm(!showCreateForm);
    setCreateFormData(initialVocabForm);
    setEditingVocabId(null); // Close any edit form
    setFormError(null);
  };

  // Handle toggling the edit form
  const handleUpdateVocab = (vocabId: number) => {
    if (editingVocabId === vocabId) {
      // If clicking same vocab, close the form
      setEditingVocabId(null);
      setEditFormData(initialVocabForm);
    } else {
      // Find the vocab to edit
      const vocabToEdit = vocabs.find(v => v.id === vocabId);
      if (vocabToEdit) {
        setEditFormData({
          word: vocabToEdit.word || '',
          translation: vocabToEdit.translation || '',
          definition: vocabToEdit.definition || '',
          part_of_speech: vocabToEdit.part_of_speech || 'noun',
          example_sentence: vocabToEdit.example_sentence || '',
          synonyms: vocabToEdit.synonyms || '',
          antonyms: vocabToEdit.antonyms || ''
        });
        setEditingVocabId(vocabId);
        setShowCreateForm(false); // Close create form if open
        setFormError(null);
      }
    }
  };

  // Handle create form input changes
  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle edit form input changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit the create form
  const handleCreateVocabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    
    try {
      const listId = parseInt(resolvedParams.vocabId);
      await createVocab(listId, createFormData);
      
      // Reset form and refresh vocab list
      setCreateFormData(initialVocabForm);
      setShowCreateForm(false);
      await fetchVocabList();
    } catch (err) {
      console.error('Error creating vocabulary:', err);
      setFormError('Failed to create vocabulary. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit the edit form
  const handleEditVocabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVocabId) return;
    
    setFormSubmitting(true);
    setFormError(null);
    
    try {
      await updateVocab(editingVocabId, editFormData);
      
      // Reset form and refresh vocab list
      setEditingVocabId(null);
      setEditFormData(initialVocabForm);
      await fetchVocabList();
    } catch (err) {
      console.error('Error updating vocabulary:', err);
      setFormError('Failed to update vocabulary. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Render form component for both create and edit
  const renderVocabForm = (
    isEdit: boolean, 
    formData: typeof initialVocabForm, 
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
    handleSubmit: (e: React.FormEvent) => void
  ) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-blue-200">
        <h2 className="text-xl font-bold text-blue-800 mb-4">
          {isEdit ? 'Edit Vocabulary' : 'Create New Vocabulary'}
        </h2>
        
        {formError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Word */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Word</label>
              <input
                type="text"
                name="word"
                value={formData.word}
                onChange={handleChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Translation */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Translation</label>
              <input
                type="text"
                name="translation"
                value={formData.translation}
                onChange={handleChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Part of Speech */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Part of Speech</label>
              <select
                name="part_of_speech"
                value={formData.part_of_speech}
                onChange={handleChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="pronoun">Pronoun</option>
                <option value="preposition">Preposition</option>
                <option value="phrasal verb">Phrasal Verb</option>
                <option value="collocation">Collocation</option>
              </select>
            </div>
          </div>
          
          {/* Definition */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Definition</label>
            <textarea
              name="definition"
              value={formData.definition}
              onChange={handleChange}
              required
              rows={2}
              className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Example Sentence */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Example Sentence</label>
            <textarea
              name="example_sentence"
              value={formData.example_sentence}
              onChange={handleChange}
              required
              rows={2}
              className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Synonyms */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Synonyms</label>
              <input
                type="text"
                name="synonyms"
                value={formData.synonyms}
                onChange={handleChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Antonyms */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Antonyms (optional)</label>
              <input
                type="text"
                name="antonyms"
                value={formData.antonyms}
                onChange={handleChange}
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={isEdit ? () => setEditingVocabId(null) : handleCreateVocab}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${formSubmitting ? 'bg-blue-400' : 'bg-blue-600'} text-white rounded hover:bg-blue-700`}
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Saving...' : isEdit ? 'Update Vocabulary' : 'Create Vocabulary'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold">{vocabList?.title || 'Vocabulary List'}</h1>
        </div>
      </div>

      {/* Actions: Search & Create */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <form onSubmit={handleSearch} className="flex-grow w-full">
            <input
              type="text"
              placeholder="Search vocabularies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </form>
          <button
            onClick={handleCreateVocab}
            className="px-6 py-4 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Create New Vocab
          </button>
        </div>
      </div>
      
      {/* Create Form (conditional) */}
      <div className="max-w-7xl mx-auto px-6">
        {showCreateForm && renderVocabForm(false, createFormData, handleCreateFormChange, handleCreateVocabSubmit)}
      </div>

      {/* Vocabulary Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-xl font-semibold text-center my-8">{error}</div>
        ) : vocabs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vocabs.map((vocab) => (
              <React.Fragment key={vocab.id}>
                {/* Edit Form (conditional) */}
                {editingVocabId === vocab.id && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    {renderVocabForm(true, editFormData, handleEditFormChange, handleEditVocabSubmit)}
                  </div>
                )}
                
                <div
                  className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300"
                >
                  {/* Card Header */}
                  <div className="px-6 py-4 bg-blue-50 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-blue-800">{vocab.word}</h2>
                    <button
                      onClick={() => handleUpdateVocab(vocab.id)}
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
                    >
                      Edit
                    </button>
                  </div>
                  {/* Card Body: Each field on the same row */}
                  <div className="px-6 py-4 flex-grow space-y-3">
                    <div className="flex">
                      <span className="w-32 font-semibold text-gray-700">Translation:</span>
                      <span className="text-gray-900">{vocab.translation}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-gray-700">Part of Speech:</span>
                      <span className="italic text-gray-800">{vocab.part_of_speech}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-gray-700">Definition:</span>
                      <span className="text-gray-800">{vocab.definition}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-gray-700">Example:</span>
                      <span className="italic text-gray-700">{vocab.example_sentence}</span>
                    </div>
                    {vocab.synonyms && (
                      <div className="flex">
                        <span className="w-32 font-semibold text-gray-700">Synonyms:</span>
                        <span className="text-gray-800">{vocab.synonyms}</span>
                      </div>
                    )}
                    {vocab.antonyms && (
                      <div className="flex">
                        <span className="w-32 font-semibold text-gray-700">Antonyms:</span>
                        <span className="text-gray-800">{vocab.antonyms}</span>
                      </div>
                    )}
                  </div>
                  {/* Card Footer */}
                  <div className="px-6 py-3 bg-gray-100 border-t flex items-center">
                    <span className="text-sm font-medium text-gray-700">Created by:</span>
                    <span className="text-sm text-blue-600 font-semibold ml-2">
                      {vocab.student?.userFullName || 'Unknown'}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center my-16 text-xl">
            {searchQuery ? 'No vocabularies match your search.' : 'No vocabularies available in this list.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabDetailPage;