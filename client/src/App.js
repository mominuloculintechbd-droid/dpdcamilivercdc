import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ReportPage from './pages/ReportPage';
import { ScrollArea } from './components/ui/scroll-area';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import { reportCategories, isParametricReport, getAllReports } from './config/reportCategories';

const NavigationItem = ({ report, isActive, searchTerm }) => {
  const reportName = report.replace(/_/g, ' ');
  const isParametric = isParametricReport(report);

  // Highlight matching search term
  const highlightText = (text, term) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <Link to={`/reports/${report}`} className="block">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-left font-normal text-sm",
          isActive && "bg-gray-100 text-gray-900 font-medium"
        )}
      >
        {highlightText(reportName, searchTerm)}
        {isParametric && (
          <span className="ml-auto text-gray-400" title="Requires parameters">
            ⚙️
          </span>
        )}
      </Button>
    </Link>
  );
};

const Navigation = () => {
  const location = useLocation();
  const currentReport = location.pathname.split('/reports/')[1];
  const [searchTerm, setSearchTerm] = useState('');

  // Filter reports based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return reportCategories;

    const term = searchTerm.toLowerCase();
    return reportCategories
      .map(category => ({
        ...category,
        reports: category.reports.filter(report =>
          report.replace(/_/g, ' ').toLowerCase().includes(term)
        )
      }))
      .filter(category => category.reports.length > 0);
  }, [searchTerm]);

  const totalReports = getAllReports().length;
  const filteredCount = filteredCategories.reduce(
    (sum, cat) => sum + cat.reports.length,
    0
  );

  return (
    <nav className="w-72 border-r border-gray-200 bg-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500 mt-1">
          {searchTerm ? `${filteredCount} of ${totalReports}` : `${totalReports} reports available`}
        </p>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 pr-9 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Categories and Reports */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No reports found matching "{searchTerm}"
            </div>
          ) : (
            filteredCategories.map(category => (
              <div key={category.id} className="mb-4">
                {/* Category Header */}
                <div className="px-3 py-2 bg-gray-50 rounded-md mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {category.name}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      {category.reports.length}
                    </span>
                  </div>
                </div>

                {/* Reports in Category */}
                <div className="space-y-0.5">
                  {category.reports.map(report => (
                    <NavigationItem
                      key={report}
                      report={report}
                      isActive={currentReport === report}
                      searchTerm={searchTerm}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/reports/:reportName" element={<ReportPage />} />
              <Route path="/" element={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Oracle Reporting Dashboard</h1>
                    <p className="text-gray-600">Select a report from the navigation to view data</p>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;