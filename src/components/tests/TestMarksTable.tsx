'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestMarkEntry } from '@/types/testMarks';
import { formatDate } from '@/lib/utils';
import { Search, Trash2, BookOpen, Award, FileText } from 'lucide-react';
import { EmptyTestScoresIllustration } from '@/components/illustrations';

interface TestMarksTableProps {
  testMarks: TestMarkEntry[];
  onDeleteTest?: (id: string) => void;
}

export const TestMarksTable: React.FC<TestMarksTableProps> = ({
  testMarks,
  onDeleteTest,
}) => {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const filteredMarks = testMarks.filter((t) => {
    const q = search.toLowerCase();
    const titleMatch = t.paperTitle.toLowerCase().includes(q);
    const subMatch = t.subject.toLowerCase().includes(q);
    const typeMatch = t.examType.toLowerCase().includes(q);

    if (!titleMatch && !subMatch && !typeMatch) return false;
    if (subjectFilter !== 'all' && t.subject.toLowerCase() !== subjectFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="rounded-2xl border border-[#dec0b7] bg-white shadow-sm overflow-hidden">
      <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dec0b7]">
        <div>
          <h2 className="text-base font-serif font-bold text-[#1d1b19] flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#9f3c16]" strokeWidth={2} />
            <span>Test Marks History & Performance Log</span>
          </h2>
          <p className="text-xs text-[#2d2420] mt-0.5">
            Chronological record of school term tests, model papers, and revision assessments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4a3b35]" strokeWidth={1.5} />
            <Input
              placeholder="Search papers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-[#fef8f4] border-[#dec0b7] text-xs h-9 text-[#1d1b19] placeholder:text-[#4a3b35] rounded-xl"
            />
          </div>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="bg-[#fef8f4] border-[#dec0b7] text-xs h-9 text-[#1d1b19] w-36 rounded-xl font-medium">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#dec0b7] text-[#1d1b19] text-xs rounded-xl shadow-lg">
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="combined maths">Combined Maths</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="biology">Biology</SelectItem>
              <SelectItem value="ict">ICT</SelectItem>
              <SelectItem value="agriculture">Agriculture</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        {filteredMarks.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <EmptyTestScoresIllustration size={150} className="mx-auto mb-2" />
            <h4 className="text-base font-serif font-semibold text-[#1d1b19] mt-2">No Exam Records Found</h4>
            <p className="text-xs text-[#2d2420] mt-1 max-w-sm mx-auto leading-relaxed">
              No test marks logged yet. Click &quot;Add Test Score&quot; above to log your school term tests and model papers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#f8f2ef]">
                <TableRow className="border-b border-[#dec0b7]">
                  <TableHead className="text-xs text-[#2d2420] font-mono font-semibold">Date</TableHead>
                  <TableHead className="text-xs text-[#2d2420] font-mono font-semibold">Subject & Paper</TableHead>
                  <TableHead className="text-xs text-[#2d2420] font-mono font-semibold">Type</TableHead>
                  <TableHead className="text-xs text-[#2d2420] font-mono font-semibold text-right">Score</TableHead>
                  <TableHead className="text-xs text-[#2d2420] font-mono font-semibold text-right">Rank</TableHead>
                  <TableHead className="text-xs text-[#2d2420] font-mono font-semibold">Notes</TableHead>
                  {onDeleteTest && <TableHead className="text-xs text-[#2d2420] font-mono font-semibold text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarks.map((t) => (
                  <TableRow key={t.id} className="border-b border-[#dec0b7]/50 hover:bg-[#f8f2ef]/50">
                    <TableCell className="font-mono text-xs text-[#2d2420]">
                      {formatDate(t.testDate, 'short')}
                    </TableCell>
                    <TableCell>
                      <span className="font-serif font-bold text-xs text-[#1d1b19] block">{t.paperTitle}</span>
                      <span className="text-[11px] font-mono text-[#9f3c16] font-semibold">{t.subject}</span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#f3ede9] border border-[#dec0b7] text-[#1d1b19] font-medium">
                        {t.examType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-bold text-xs ${
                        t.score >= 75
                          ? 'text-[#456644]'
                          : t.score >= 65
                          ? 'text-[#1d1b19]'
                          : t.score >= 50
                          ? 'text-[#854f00]'
                          : 'text-[#ba1a1a]'
                      }`}>
                        {t.score.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-[#2d2420]">
                      {t.rank ? `#${t.rank}` : 'â€”'}
                    </TableCell>
                    <TableCell className="text-xs text-[#2d2420] max-w-[200px] truncate">
                      {t.notes || 'â€”'}
                    </TableCell>
                    {onDeleteTest && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTest(t.id)}
                          className="h-7 px-2 text-[#9f3c16] hover:text-[#822801] hover:bg-[#9f3c16]/10 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
