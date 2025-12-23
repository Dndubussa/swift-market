'use client';
import { useState } from 'react';
import PropTypes from 'prop-types';

export default function FAQSection({ categories }) {
  const [expandedArticle, setExpandedArticle] = useState(null);

  const toggleArticle = (articleId) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

  return (
    <div className="space-y-8">
      {categories?.length > 0 ? (
        categories?.map(category => (
          <div key={category?.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {category?.name}
              </h2>
              {category?.description && (
                <p className="text-gray-600">{category?.description}</p>
              )}
            </div>

            <div className="space-y-3">
              {category?.articles?.length > 0 ? (
                category?.articles?.map(article => (
                  <div
                    key={article?.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleArticle(article?.id)}
                      className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                    >
                      <span className="font-medium text-gray-900 pr-4">
                        {article?.question}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform ${
                          expandedArticle === article?.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedArticle === article?.id && (
                      <div className="px-6 py-4 bg-white">
                        <p className="text-gray-700 mb-4">{article?.answer}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500">Was this helpful?</span>
                          <button className="flex items-center text-green-600 hover:text-green-700">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            Yes ({article?.helpfulCount || 0})
                          </button>
                          <button className="flex items-center text-red-600 hover:text-red-700">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                            </svg>
                            No ({article?.notHelpfulCount || 0})
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 py-4">No articles available in this category</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQ Available</h3>
          <p className="text-gray-500">FAQ content is being prepared</p>
        </div>
      )}
    </div>
  );
}

FAQSection.propTypes = {
  categories: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      name: PropTypes?.string?.isRequired,
      description: PropTypes?.string,
      articles: PropTypes?.arrayOf(
        PropTypes?.shape({
          id: PropTypes?.string?.isRequired,
          question: PropTypes?.string?.isRequired,
          answer: PropTypes?.string?.isRequired,
          helpfulCount: PropTypes?.number,
          notHelpfulCount: PropTypes?.number
        })
      )
    })
  )?.isRequired
};