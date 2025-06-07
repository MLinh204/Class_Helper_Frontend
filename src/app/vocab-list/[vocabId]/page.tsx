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
  updateVocab,
  createVocabExternal,
  sortVocabs
} from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { ChevronDownIcon, ArrowsUpDownIcon, PlusIcon } from '@heroicons/react/24/solid';

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

// Initial form values for external vocab creation (simpler)
const initialExternalVocabForm = {
  word: '',
  translation: ''
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

  // External vocab form state
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [externalFormData, setExternalFormData] = useState(initialExternalVocabForm);
  const [externalFormSubmitting, setExternalFormSubmitting] = useState(false);
  const [externalFormError, setExternalFormError] = useState<string | null>(null);

  // Sort state
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-id="vocab-detail-sort-container"]')) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSortDropdown]);

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
      setCreateFormData(initialVocabForm);
      setShowCreateForm(false);
      await fetchVocabList();
      toast.success('Vocabulary created successfully');
    } catch (err) {
      console.error('Error creating vocabulary:', err);
      toast.error('Failed to create vocabulary');
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
      setEditingVocabId(null);
      setEditFormData(initialVocabForm);
      await fetchVocabList();
      toast.success('Vocabulary updated successfully');
    } catch (err) {
      console.error('Error updating vocabulary:', err);
      toast.error('Failed to update vocabulary');
      setFormError('Failed to update vocabulary. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle toggling the external vocab form
  const handleCreateExternalVocab = () => {
    setShowExternalForm(!showExternalForm);
    setExternalFormData(initialExternalVocabForm);
    setShowCreateForm(false); // Close regular create form if open
    setEditingVocabId(null); // Close any edit form
    setExternalFormError(null);
  };

  // Handle external form input changes
  const handleExternalFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExternalFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit the external vocab form
  const handleExternalVocabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExternalFormSubmitting(true);
    setExternalFormError(null);
    try {
      const listId = parseInt(resolvedParams.vocabId);
      await createVocabExternal(listId, externalFormData);
      setExternalFormData(initialExternalVocabForm);
      setShowExternalForm(false);
      await fetchVocabList();
      toast.success('Admin vocab created successfully');
    } catch (err) {
      console.error('Error creating external vocabulary:', err);
      toast.error('Failed to create admin vocabulary');
      setExternalFormError('Failed to create vocabulary. Please try again.');
    } finally {
      setExternalFormSubmitting(false);
    }
  };

  // Handle sort functionality
  const handleSort = async (column: string, order: string) => {
    try {
      const listId = parseInt(resolvedParams.vocabId);
      const response = await sortVocabs(listId, column, order);
      
      // For each vocab in sorted results, fetch student details for creator
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
      setShowSortDropdown(false);
      setError(null);
    } catch (err) {
      console.error('Error sorting vocabularies:', err);
      setError('An error occurred while sorting.');
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
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-blue-200" data-id={`vocab-form-${isEdit ? 'edit' : 'create'}`}>
        <h2 className="text-xl font-bold text-blue-800 mb-4" data-id={`vocab-form-title-${isEdit ? 'edit' : 'create'}`}>
          {isEdit ? 'Edit Vocabulary' : 'Create New Vocabulary'}
        </h2>
        
        {formError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4" data-id={`vocab-form-error-${isEdit ? 'edit' : 'create'}`}>
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4" data-id={`vocab-form-element-${isEdit ? 'edit' : 'create'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id={`vocab-form-grid-${isEdit ? 'edit' : 'create'}`}>
            {/* Word */}
            <div data-id={`vocab-form-word-field-${isEdit ? 'edit' : 'create'}`}>
              <label className="block text-gray-700 font-medium mb-1" data-id={`vocab-form-word-label-${isEdit ? 'edit' : 'create'}`}>Word</label>
              <input
                type="text"
                name="word"
                value={formData.word}
                onChange={handleChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-id={`vocab-form-word-input-${isEdit ? 'edit' : 'create'}`}
              />
            </div>
            
            {/* Translation */}
            <div data-id={`vocab-form-translation-field-${isEdit ? 'edit' : 'create'}`}>
              <label className="block text-gray-700 font-medium mb-1" data-id={`vocab-form-translation-label-${isEdit ? 'edit' : 'create'}`}>Translation</label>
              <input
                type="text"
                name="translation"
                value={formData.translation}
                onChange={handleChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-id={`vocab-form-translation-input-${isEdit ? 'edit' : 'create'}`}
              />
            </div>
            
            {/* Part of Speech */}
            <div data-id={`vocab-form-pos-field-${isEdit ? 'edit' : 'create'}`}>
              <label className="block text-gray-700 font-medium mb-1" data-id={`vocab-form-pos-label-${isEdit ? 'edit' : 'create'}`}>Part of Speech</label>
              <select
                name="part_of_speech"
                value={formData.part_of_speech}
                onChange={handleChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-id={`vocab-form-pos-select-${isEdit ? 'edit' : 'create'}`}
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
          <div data-id={`vocab-form-definition-field-${isEdit ? 'edit' : 'create'}`}>
            <label className="block text-gray-700 font-medium mb-1" data-id={`vocab-form-definition-label-${isEdit ? 'edit' : 'create'}`}>Definition</label>
            <textarea
              name="definition"
              value={formData.definition}
              onChange={handleChange}
              required
              rows={2}
              className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-id={`vocab-form-definition-input-${isEdit ? 'edit' : 'create'}`}
            />
          </div>
          
          {/* Example Sentence */}
          <div data-id={`vocab-form-example-field-${isEdit ? 'edit' : 'create'}`}>
            <label className="block text-gray-700 font-medium mb-1" data-id={`vocab-form-example-label-${isEdit ? 'edit' : 'create'}`}>Example Sentence</label>
            <textarea
              name="example_sentence"
              value={formData.example_sentence}
              onChange={handleChange}
              required
              rows={2}
              className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-id={`vocab-form-example-input-${isEdit ? 'edit' : 'create'}`}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id={`vocab-form-synonyms-antonyms-grid-${isEdit ? 'edit' : 'create'}`}>
            {/* Synonyms */}
            <div data-id={`vocab-form-synonyms-field-${isEdit ? 'edit' : 'create'}`}>
              <label className="block text-gray-700 font-medium mb-1" data-id={`vocab-form-synonyms-label-${isEdit ? 'edit' : 'create'}`}>Synonyms</label>
              <input
                type="text"
                name="synonyms"
                value={formData.synonyms}
                onChange={handleChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-id={`vocab-form-synonyms-input-${isEdit ? 'edit' : 'create'}`}
              />
            </div>
            
            {/* Antonyms */}
            <div data-id={`vocab-form-antonyms-field-${isEdit ? 'edit' : 'create'}`}>
              <label className="block text-gray-700 font-medium mb-1" data-id={`vocab-form-antonyms-label-${isEdit ? 'edit' : 'create'}`}>Antonyms (optional)</label>
              <input
                type="text"
                name="antonyms"
                value={formData.antonyms}
                onChange={handleChange}
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-id={`vocab-form-antonyms-input-${isEdit ? 'edit' : 'create'}`}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2" data-id={`vocab-form-buttons-${isEdit ? 'edit' : 'create'}`}>
            <button
              type="button"
              onClick={isEdit ? () => setEditingVocabId(null) : handleCreateVocab}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              disabled={formSubmitting}
              data-id={`vocab-form-cancel-button-${isEdit ? 'edit' : 'create'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${formSubmitting ? 'bg-blue-400' : 'bg-blue-600'} text-white rounded hover:bg-blue-700`}
              disabled={formSubmitting}
              data-id={`vocab-form-submit-button-${isEdit ? 'edit' : 'create'}`}
            >
              {formSubmitting ? 'Saving...' : isEdit ? 'Update Vocabulary' : 'Create Vocabulary'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Render external vocab form (simplified)
  const renderExternalVocabForm = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-purple-200" data-id="vocab-external-form">
        <h2 className="text-xl font-bold text-purple-800 mb-4" data-id="vocab-external-form-title">
          Create Vocabulary (Admin)
        </h2>
        
        {externalFormError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4" data-id="vocab-external-form-error">
            {externalFormError}
          </div>
        )}
        
        <form onSubmit={handleExternalVocabSubmit} className="space-y-4" data-id="vocab-external-form-element">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="vocab-external-form-grid">
            {/* Word */}
            <div data-id="vocab-external-form-word-field">
              <label className="block text-gray-700 font-medium mb-1" data-id="vocab-external-form-word-label">Word</label>
              <input
                type="text"
                name="word"
                value={externalFormData.word}
                onChange={handleExternalFormChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                data-id="vocab-external-form-word-input"
              />
            </div>
            
            {/* Translation */}
            <div data-id="vocab-external-form-translation-field">
              <label className="block text-gray-700 font-medium mb-1" data-id="vocab-external-form-translation-label">Translation</label>
              <input
                type="text"
                name="translation"
                value={externalFormData.translation}
                onChange={handleExternalFormChange}
                required
                className="text-gray-500 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                data-id="vocab-external-form-translation-input"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2" data-id="vocab-external-form-buttons">
            <button
              type="button"
              onClick={handleCreateExternalVocab}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              disabled={externalFormSubmitting}
              data-id="vocab-external-form-cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${externalFormSubmitting ? 'bg-purple-400' : 'bg-purple-600'} text-white rounded hover:bg-purple-700`}
              disabled={externalFormSubmitting}
              data-id="vocab-external-form-submit-button"
            >
              {externalFormSubmitting ? 'Creating...' : 'Create Vocabulary'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
   <>
    <Toaster position="top-right" />
    <div className="min-h-screen bg-gray-50" data-id="vocab-detail-page-container">
      <NavigationBar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-12" data-id="vocab-detail-hero-section">
        <div className="max-w-7xl mx-auto px-6" data-id="vocab-detail-hero-content">
          <h1 className="text-4xl font-extrabold" data-id="vocab-detail-title">{vocabList?.title || 'Vocabulary List'}</h1>
        </div>
      </div>

      {/* Actions: Search & Create */}
      <div className="max-w-7xl mx-auto px-6 py-8" data-id="vocab-detail-actions-section">
        <div className="flex flex-col md:flex-row items-center gap-4" data-id="vocab-detail-actions-wrapper">
          <form onSubmit={handleSearch} className="flex-grow w-full" data-id="vocab-detail-search-form">
            <input
              type="text"
              placeholder="Search vocabularies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              data-id="vocab-detail-search-input"
            />
          </form>
          <button
            onClick={handleCreateVocab}
            className="px-6 py-4 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            data-id="vocab-detail-create-button"
          >
            Create New Vocab
          </button>
          <button
            onClick={handleCreateExternalVocab}
            className="px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            data-id="vocab-detail-create-admin-button"
          >
            Create Vocab Admin
          </button>
          
          {/* Sort Button with Dropdown */}
          <div className="relative" data-id="vocab-detail-sort-container">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 flex items-center gap-2"
              data-id="vocab-detail-sort-button"
            >
              <ArrowsUpDownIcon className="w-5 h-5" />
              Sort
            </button>
            
            {/* Sort Dropdown */}
            {showSortDropdown && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                data-id="vocab-detail-sort-dropdown"
              >
                <div className="py-2" data-id="vocab-detail-sort-options">
                  {/* Created Student */}
                  <div className="px-4 py-2 border-b border-gray-100" data-id="vocab-sort-created-student-section">
                    <div className="font-semibold text-gray-700 mb-2" data-id="vocab-sort-created-student-label">Created Student</div>
                    <div className="flex gap-2" data-id="vocab-sort-created-student-options">
                      <button
                        onClick={() => handleSort('created_by', 'ASC')}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition duration-200"
                        data-id="vocab-sort-created-student-asc"
                      >
                        Ascending
                      </button>
                      <button
                        onClick={() => handleSort('created_by', 'DESC')}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition duration-200"
                        data-id="vocab-sort-created-student-desc"
                      >
                        Descending
                      </button>
                    </div>
                  </div>
                  
                  {/* Created Date */}
                  <div className="px-4 py-2 border-b border-gray-100" data-id="vocab-sort-created-date-section">
                    <div className="font-semibold text-gray-700 mb-2" data-id="vocab-sort-created-date-label">Created Date</div>
                    <div className="flex gap-2" data-id="vocab-sort-created-date-options">
                      <button
                        onClick={() => handleSort('created_at', 'ASC')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition duration-200"
                        data-id="vocab-sort-created-date-asc"
                      >
                        Ascending
                      </button>
                      <button
                        onClick={() => handleSort('created_at', 'DESC')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition duration-200"
                        data-id="vocab-sort-created-date-desc"
                      >
                        Descending
                      </button>
                    </div>
                  </div>
                  
                  {/* Word */}
                  <div className="px-4 py-2" data-id="vocab-sort-word-section">
                    <div className="font-semibold text-gray-700 mb-2" data-id="vocab-sort-word-label">Word</div>
                    <div className="flex gap-2" data-id="vocab-sort-word-options">
                      <button
                        onClick={() => handleSort('word', 'ASC')}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition duration-200"
                        data-id="vocab-sort-word-asc"
                      >
                        Ascending
                      </button>
                      <button
                        onClick={() => handleSort('word', 'DESC')}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition duration-200"
                        data-id="vocab-sort-word-desc"
                      >
                        Descending
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Form (conditional) */}
      <div className="max-w-7xl mx-auto px-6" data-id="vocab-detail-create-form-section">
        {showCreateForm && renderVocabForm(false, createFormData, handleCreateFormChange, handleCreateVocabSubmit)}
      </div>

      {/* External Vocab Form (conditional) */}
      <div className="max-w-7xl mx-auto px-6" data-id="vocab-detail-external-form-section">
        {showExternalForm && renderExternalVocabForm()}
      </div>

      {/* Vocabulary Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-12" data-id="vocab-detail-cards-section">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse" data-id="vocab-detail-loading-skeleton">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 space-y-4">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-xl font-semibold text-center my-8" data-id="vocab-detail-error-message">{error}</div>
        ) : vocabs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-id="vocab-detail-cards-grid">
            {vocabs.map((vocab) => (
              <React.Fragment key={vocab.id}>
                {/* Edit Form (conditional) */}
                {editingVocabId === vocab.id && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3" data-id={`vocab-edit-form-${vocab.id}`}>
                    {renderVocabForm(true, editFormData, handleEditFormChange, handleEditVocabSubmit)}
                  </div>
                )}
                
                <div
                  className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300"
                  data-id={`vocab-card-${vocab.id}`}
                >
                  {/* Card Header */}
                  <div className="px-6 py-4 bg-blue-50 flex justify-between items-center" data-id={`vocab-card-header-${vocab.id}`}>
                    <h2 className="text-2xl font-bold text-blue-800" data-id={`vocab-word-${vocab.id}`}>{vocab.word}</h2>
                    <button
                      onClick={() => handleUpdateVocab(vocab.id)}
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
                      data-id={`vocab-edit-button-${vocab.id}`}
                    >
                      Edit
                    </button>
                  </div>
                  {/* Card Body: Each field on the same row */}
                  <div className="px-6 py-4 flex-grow space-y-3" data-id={`vocab-card-body-${vocab.id}`}>
                    <div className="flex" data-id={`vocab-translation-${vocab.id}`}>
                      <span className="w-32 font-semibold text-gray-700" data-id={`vocab-translation-label-${vocab.id}`}>Translation:</span>
                      <span className="text-gray-900" data-id={`vocab-translation-value-${vocab.id}`}>{vocab.translation}</span>
                    </div>
                    <div className="flex" data-id={`vocab-pos-${vocab.id}`}>
                      <span className="w-32 font-semibold text-gray-700" data-id={`vocab-pos-label-${vocab.id}`}>Part of Speech:</span>
                      <span className="italic text-gray-800" data-id={`vocab-pos-value-${vocab.id}`}>{vocab.part_of_speech}</span>
                    </div>
                    <div className="flex" data-id={`vocab-definition-${vocab.id}`}>
                      <span className="w-32 font-semibold text-gray-700" data-id={`vocab-definition-label-${vocab.id}`}>Definition:</span>
                      <span className="text-gray-800" data-id={`vocab-definition-value-${vocab.id}`}>{vocab.definition}</span>
                    </div>
                    <div className="flex" data-id={`vocab-example-${vocab.id}`}>
                      <span className="w-32 font-semibold text-gray-700" data-id={`vocab-example-label-${vocab.id}`}>Example:</span>
                      <span className="italic text-gray-700" data-id={`vocab-example-value-${vocab.id}`}>{vocab.example_sentence}</span>
                    </div>
                    {vocab.synonyms && (
                      <div className="flex" data-id={`vocab-synonyms-${vocab.id}`}>
                        <span className="w-32 font-semibold text-gray-700" data-id={`vocab-synonyms-label-${vocab.id}`}>Synonyms:</span>
                        <span className="text-gray-800" data-id={`vocab-synonyms-value-${vocab.id}`}>{vocab.synonyms}</span>
                      </div>
                    )}
                    {vocab.antonyms && (
                      <div className="flex" data-id={`vocab-antonyms-${vocab.id}`}>
                        <span className="w-32 font-semibold text-gray-700" data-id={`vocab-antonyms-label-${vocab.id}`}>Antonyms:</span>
                        <span className="text-gray-800" data-id={`vocab-antonyms-value-${vocab.id}`}>{vocab.antonyms}</span>
                      </div>
                    )}
                  </div>
                  {/* Card Footer */}
                  <div className="px-6 py-3 bg-gray-100 border-t flex items-center" data-id={`vocab-card-footer-${vocab.id}`}>
                    <span className="text-sm font-medium text-gray-700" data-id={`vocab-creator-label-${vocab.id}`}>Created by:</span>
                    <span className="text-sm text-blue-600 font-semibold ml-2" data-id={`vocab-creator-value-${vocab.id}`}>
                      {vocab.student?.userFullName || 'Unknown'}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center my-16 text-xl" data-id="vocab-detail-empty-state">
            {searchQuery ? 'No vocabularies match your search.' : 'No vocabularies available in this list.'}
          </div>
        )}
      </div>
    </div>
   </>
  );
};

export default VocabDetailPage;