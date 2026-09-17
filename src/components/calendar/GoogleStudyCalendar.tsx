'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CalendarStudyEvent,
  GCAL_COLORS,
  DEFAULT_SUBJECT_COLORS,
  generateGoogleCalendarUrl,
  downloadIcsFile,
  parseIcsContent,
  generateSmartAiWeeklySchedule,
  getExamCountdown,
  getStreamSubjectNames,
} from '@/lib/calendar';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Download,
  Upload,
  Video,
  ExternalLink,
  Smartphone,
  Palette,
  X,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { safeStorage } from '@/lib/storage/safeStorage';

type CalendarViewMode = 'month' | 'week' | 'day';

export function GoogleStudyCalendar() {
  const { member, logs } = useApp();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarStudyEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarStudyEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubjectColorsOpen, setIsSubjectColorsOpen] = useState(false);
  const [isCountdownModalOpen, setIsCountdownModalOpen] = useState(false);
  const [isAiScheduleConfirmOpen, setIsAiScheduleConfirmOpen] = useState(false);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

  const [subjectColors, setSubjectColors] = useState<Record<string, string>>(() => {
    return safeStorage.getJson('studysync_subject_colors', DEFAULT_SUBJECT_COLORS);
  });

  const stream = member?.stream || 'Physical Science (Maths)';
  const [sub1, sub2, sub3] = useMemo(() => getStreamSubjectNames(stream), [stream]);

  useEffect(() => {
    const pastEvents: CalendarStudyEvent[] = [];
    if (logs && logs.length > 0) {
      logs.forEach((log) => {
        const dateStr = log.dateOfStudy;
        if (!dateStr) return;

        if (log.sessions && log.sessions.length > 0) {
          log.sessions.forEach((s) => {
            const color = subjectColors[s.subject] || DEFAULT_SUBJECT_COLORS[s.subject] || '#039be5';
            pastEvents.push({
              id: 'past_sess_' + (s.id || Math.random()),
              title: s.subject + ': ' + (s.topic || s.hours + ' hrs studied'),
              subject: s.subject,
              date: dateStr,
              startTime: s.startTime || '09:00',
              endTime: s.endTime || '11:00',
              durationHours: s.hours || 2.0,
              type: 'past_log',
              color: color,
              notes: s.notes || log.notes || 'Logged study session',
              topic: s.topic,
              isPast: true,
              completed: true,
            });
          });
        } else {
          const s1Hrs = Number(log.hoursSubject1 || log.subject1Hours || 0);
          const s2Hrs = Number(log.hoursSubject2 || log.subject2Hours || 0);
          const s3Hrs = Number(log.hoursSubject3 || log.subject3Hours || 0);

          if (s1Hrs > 0) {
            pastEvents.push({
              id: 'past_' + log.dateOfStudy + '_1',
              title: sub1 + ': ' + s1Hrs.toFixed(1) + ' hrs studied',
              subject: sub1,
              date: dateStr,
              startTime: '08:30',
              endTime: '11:00',
              durationHours: s1Hrs,
              type: 'past_log',
              color: subjectColors[sub1] || DEFAULT_SUBJECT_COLORS[sub1] || '#0b8043',
              notes: log.notes || 'Completed daily study',
              isPast: true,
              completed: true,
            });
          }
          if (s2Hrs > 0) {
            pastEvents.push({
              id: 'past_' + log.dateOfStudy + '_2',
              title: sub2 + ': ' + s2Hrs.toFixed(1) + ' hrs studied',
              subject: sub2,
              date: dateStr,
              startTime: '13:30',
              endTime: '15:30',
              durationHours: s2Hrs,
              type: 'past_log',
              color: subjectColors[sub2] || DEFAULT_SUBJECT_COLORS[sub2] || '#8e24aa',
              notes: log.notes || 'Completed daily study',
              isPast: true,
              completed: true,
            });
          }
          if (s3Hrs > 0) {
            pastEvents.push({
              id: 'past_' + log.dateOfStudy + '_3',
              title: sub3 + ': ' + s3Hrs.toFixed(1) + ' hrs studied',
              subject: sub3,
              date: dateStr,
              startTime: '18:30',
              endTime: '20:30',
              durationHours: s3Hrs,
              type: 'past_log',
              color: subjectColors[sub3] || DEFAULT_SUBJECT_COLORS[sub3] || '#039be5',
              notes: log.notes || 'Completed daily study',
              isPast: true,
              completed: true,
            });
          }
        }
      });
    }

    let planned: CalendarStudyEvent[] = safeStorage.getJson<CalendarStudyEvent[]>('studysync_calendar_events', []);

    if (planned.length === 0) {
      planned = generateSmartAiWeeklySchedule(stream, sub1, sub2, sub3);
      safeStorage.setJson('studysync_calendar_events', planned);
    }

    setEvents([...pastEvents, ...planned]);
  }, [logs, member, stream, sub1, sub2, sub3, subjectColors]);

  const savePlannedEvents = (updatedAllEvents: CalendarStudyEvent[]) => {
    const plannedOnly = updatedAllEvents.filter((ev) => ev.type !== 'past_log');
    safeStorage.setJson('studysync_calendar_events', plannedOnly);
    setEvents(updatedAllEvents);
  };

  const [newEvent, setNewEvent] = useState({
    title: '',
    subject: sub1 || 'Biology',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '10:30',
    type: 'study' as 'study' | 'assignment' | 'exam',
    color: '#039be5',
    topic: '',
    notes: '',
  });

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) {
      toast.error('Please enter a title for your study session.');
      return;
    }
    const startH = parseInt(newEvent.startTime.split(':')[0], 10) + parseInt(newEvent.startTime.split(':')[1], 10) / 60;
    const endH = parseInt(newEvent.endTime.split(':')[0], 10) + parseInt(newEvent.endTime.split(':')[1], 10) / 60;
    const duration = Math.max(0.5, Number((endH - startH).toFixed(1)) || 2.0);
    const created: CalendarStudyEvent = {
      id: 'event_' + Date.now(),
      title: newEvent.title,
      subject: newEvent.subject,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      durationHours: duration,
      type: newEvent.type,
      color: newEvent.color || subjectColors[newEvent.subject] || '#039be5',
      topic: newEvent.topic,
      notes: newEvent.notes,
      studyRoomUrl: 'https://meet.jit.si/studysync-' + newEvent.subject.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4),
    };
    const updated = [...events, created];
    savePlannedEvents(updated);
    setIsAddModalOpen(false);
    toast.success('Study block added to your calendar!');
    setNewEvent({
      title: '',
      subject: sub1 || 'Biology',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:30',
      endTime: '10:30',
      type: 'study',
      color: '#039be5',
      topic: '',
      notes: '',
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    const updated = events.filter((ev) => ev.id !== eventId);
    savePlannedEvents(updated);
    setSelectedEvent(null);
    toast.success('Study block removed.');
  };

  const handleDragStart = (eventId: string) => {
    setDraggedEventId(eventId);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDropOnDate = (targetDateStr: string) => {
    if (!draggedEventId) return;
    const updated = events.map((ev) => {
      if (ev.id === draggedEventId) {
        return { ...ev, date: targetDateStr };
      }
      return ev;
    });
    savePlannedEvents(updated);
    setDraggedEventId(null);
    toast.success('Rescheduled to ' + targetDateStr + '!');
  };

  const handleGenerateAiSchedule = () => {
    const newAiEvents = generateSmartAiWeeklySchedule(stream, sub1, sub2, sub3);
    const pastLogs = events.filter((ev) => ev.type === 'past_log');
    const combined = [...pastLogs, ...newAiEvents];
    savePlannedEvents(combined);
    setIsAiScheduleConfirmOpen(false);
    toast.success('Smart AI weekly timetable generated and applied!');
  };

  const handleExportIcs = () => {
    const plannedOnly = events.filter((ev) => ev.type !== 'past_log');
    if (plannedOnly.length === 0) {
      toast.error('No planned study events to export.');
      return;
    }
    downloadIcsFile(plannedOnly, 'studysync-schedule-' + (member?.studyId || 'student') + '.ics');
    toast.success('Google Calendar .ics file downloaded!');
  };

  const handleImportIcs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      try {
        const imported = parseIcsContent(content) as CalendarStudyEvent[];
        if (imported.length === 0) {
          toast.error('No valid events found in .ics file.');
          return;
        }
        const updated = [...events, ...imported];
        savePlannedEvents(updated);
        toast.success('Successfully imported ' + imported.length + ' events from calendar file!');
      } catch (err: any) {
        toast.error('Failed to parse .ics file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleUpdateSubjectColor = (subject: string, colorHex: string) => {
    const updated = { ...subjectColors, [subject]: colorHex };
    setSubjectColors(updated);
    safeStorage.setJson('studysync_subject_colors', updated);
    const updatedEvents = events.map((ev) => {
      if (ev.subject === subject) {
        return { ...ev, color: colorHex };
      }
      return ev;
    });
    savePlannedEvents(updatedEvents);
    toast.success('Updated color for ' + subject + '!');
  };

  const countdown = useMemo(() => {
    const year = member?.examYear || member?.targetYear || '2026';
    return getExamCountdown(year);
  }, [member?.examYear, member?.targetYear]);

  const handleDownloadLockscreenWidget = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGradient.addColorStop(0, '#09090b');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1920);
    const glow = ctx.createRadialGradient(540, 600, 50, 540, 600, 450);
    glow.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(540, 600, 450, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#818cf8';
    ctx.textAlign = 'center';
    ctx.fillText('STUDYSYNC SRI LANKA', 540, 240);
    ctx.font = '500 28px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('STUDENT: ' + (member?.studyId || 'AL-STUDENT') + ' â€¢ ' + (member?.stream || 'Physical Science'), 540, 300);
    ctx.font = 'extrabold 180px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(countdown.daysRemaining), 540, 580);
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('DAYS REMAINING', 540, 660);
    ctx.font = 'bold 52px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(countdown.examName, 540, 800);
    ctx.font = '400 32px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Target Date: ' + countdown.formattedDate, 540, 860);
    ctx.font = 'italic 34px sans-serif';
    ctx.fillStyle = '#a5b4fc';
    ctx.textAlign = 'center';
    ctx.fillText('â€œConsistency today builds university success tomorrow.â€', 540, 1540);
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = 'studysync-exam-countdown-' + countdown.targetYear + '.png';
    a.click();
    toast.success('Mobile lockscreen countdown wallpaper downloaded!');
  };

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();
    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: CalendarStudyEvent[];
    }> = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevLastDay - i;
      const pMonth = month === 0 ? 12 : month;
      const pYear = month === 0 ? year - 1 : year;
      const dStr = pYear + '-' + String(pMonth).padStart(2, '0') + '-' + String(pDay).padStart(2, '0');
      days.push({
        dateStr: dStr,
        dayNumber: pDay,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        events: events.filter((e) => e.date === dStr),
      });
    }
    for (let d = 1; d <= totalDays; d++) {
      const dStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      days.push({
        dateStr: dStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        events: events.filter((e) => e.date === dStr),
      });
    }
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nMonth = month === 11 ? 1 : month + 2;
      const nYear = month === 11 ? year + 1 : year;
      const dStr = nYear + '-' + String(nMonth).padStart(2, '0') + '-' + String(n).padStart(2, '0');
      days.push({
        dateStr: dStr,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        events: events.filter((e) => e.date === dStr),
      });
    }
    return days;
  }, [currentDate, events]);

  const weekData = useMemo(() => {
    const today = new Date(currentDate);
    const dayOfWeek = (today.getDay() + 6) % 7;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const weekDays: Array<{
      dateStr: string;
      dayName: string;
      dayNumber: number;
      isToday: boolean;
      events: CalendarStudyEvent[];
    }> = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dStr = yyyy + '-' + mm + '-' + dd;
      weekDays.push({
        dateStr: dStr,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        isToday: dStr === todayStr,
        events: events.filter((e) => e.date === dStr),
      });
    }
    return weekDays;
  }, [currentDate, events]);

  const dayEvents = useMemo(() => {
    const dStr = currentDate.toISOString().split('T')[0];
    return events.filter((e) => e.date === dStr);
  }, [currentDate, events]);

  const monthTitle = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#FBF9F5] dark:bg-[#17201D] p-5 sm:p-6 rounded-2xl border border-[#E5DDD0] dark:border-white/[0.08] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#A8C7B5] border border-[#2D5A43]/20">
              <CalendarIcon className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#132219] dark:text-[#F5F1E9]">Study Calendar & Planner</h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6E6259] dark:text-[#9E9287]">
            Schedule study blocks, view past history, join study rooms, and sync with Google Calendar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setIsAiScheduleConfirmOpen(true)}
            className="h-11 sm:h-12 px-4 bg-[#2D5A43] hover:bg-[#234734] text-white text-xs sm:text-sm font-medium rounded-xl border border-[#234734] shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Study Timetable</span>
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-11 sm:h-12 px-4 bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs sm:text-sm font-medium rounded-xl border border-[#B34E29] shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Study Block</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCountdownModalOpen(true)}
            className="h-11 sm:h-12 px-3.5 border-[#E5DDD0] dark:border-white/[0.08] bg-[#F5F1E9] dark:bg-[#131B18] hover:bg-[#EFE9DF] dark:hover:bg-[#1A2521] text-[#132219] dark:text-[#F5F1E9] text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="h-4 w-4 text-[#C85A32]" />
            <span className="font-serif">{countdown.daysRemaining}d to A/L</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsSubjectColorsOpen(true)}
            className="h-11 sm:h-12 px-3.5 border-[#E5DDD0] dark:border-white/[0.08] bg-[#F5F1E9] dark:bg-[#131B18] hover:bg-[#EFE9DF] dark:hover:bg-[#1A2521] text-[#132219] dark:text-[#F5F1E9] text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Palette className="h-4 w-4 text-[#9C6328]" />
            <span className="hidden sm:inline">Subject Colors</span>
          </Button>
          <div className="flex items-center gap-1 bg-[#F5F1E9] dark:bg-[#131B18] p-1 rounded-xl border border-[#E5DDD0] dark:border-white/[0.08]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportIcs}
              title="Download Google Calendar (.ics) file"
              className="h-9 px-2.5 text-xs text-[#6E6259] dark:text-[#9E9287] hover:text-[#132219] dark:hover:text-[#F5F1E9] rounded-lg"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-[#2D5A43]" />
              <span>Export .ics</span>
            </Button>
            <label
              htmlFor="ics-upload"
              title="Import .ics file from Google Calendar"
              className="h-9 px-2.5 text-xs text-[#6E6259] dark:text-[#9E9287] hover:text-[#132219] dark:hover:text-[#F5F1E9] rounded-lg flex items-center gap-1 cursor-pointer hover:bg-[#EFE9DF] dark:hover:bg-[#1A2521] transition-colors"
            >
              <Upload className="h-3.5 w-3.5 text-[#C85A32]" />
              <span>Import</span>
              <input
                id="ics-upload"
                type="file"
                accept=".ics"
                onChange={handleImportIcs}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FBF9F5] dark:bg-[#17201D] p-4 rounded-2xl border border-[#E5DDD0] dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#132219] dark:text-[#F5F1E9] min-w-[200px]">{monthTitle}</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="h-9 w-9 p-0 rounded-lg border-[#E5DDD0] dark:border-white/[0.08] bg-[#F5F1E9] dark:bg-[#131B18] hover:bg-[#EFE9DF] dark:hover:bg-[#1A2521] text-[#132219] dark:text-[#F5F1E9]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-9 px-3 rounded-lg border-[#E5DDD0] dark:border-white/[0.08] bg-[#F5F1E9] dark:bg-[#131B18] hover:bg-[#EFE9DF] dark:hover:bg-[#1A2521] text-xs font-serif font-medium text-[#132219] dark:text-[#F5F1E9]"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="h-9 w-9 p-0 rounded-lg border-[#E5DDD0] dark:border-white/[0.08] bg-[#F5F1E9] dark:bg-[#131B18] hover:bg-[#EFE9DF] dark:hover:bg-[#1A2521] text-[#132219] dark:text-[#F5F1E9]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center p-1 bg-[#F5F1E9] dark:bg-[#131B18] rounded-xl border border-[#E5DDD0] dark:border-white/[0.08]">
          {(['month', 'week', 'day'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={'px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ' + (viewMode === mode ? 'bg-[#132219] dark:bg-[#F5F1E9] text-[#FBF9F5] dark:text-[#132219] shadow-sm' : 'text-[#6E6259] dark:text-[#9E9287] hover:text-[#132219] dark:hover:text-[#F5F1E9]')}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-[#FBF9F5] dark:bg-[#17201D] border-[#E5DDD0] dark:border-white/[0.08] shadow-sm overflow-hidden">
        <CardContent className="p-3 sm:p-6">
          {viewMode === 'month' && (
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-center font-serif font-medium text-xs text-[#6E6259] dark:text-[#9E9287] pb-2 border-b border-[#E5DDD0] dark:border-white/[0.08]">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {monthData.map((day, idx) => (
                  <div
                    key={idx}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropOnDate(day.dateStr)}
                    className={'min-h-[90px] sm:min-h-[120px] p-1.5 sm:p-2.5 rounded-xl border transition-all flex flex-col justify-between ' + (day.isToday ? 'bg-[#C85A32]/10 border-[#C85A32]/40' : day.isCurrentMonth ? 'bg-[#F5F1E9] dark:bg-[#131B18] border-[#E5DDD0] dark:border-white/[0.08] hover:border-[#C85A32]/30' : 'bg-[#FBF9F5] dark:bg-[#0F1612] border-[#E5DDD0]/40 dark:border-white/[0.04] opacity-40')}
                  >
                    <div className="flex items-center justify-between">
                      <span className={'text-xs font-mono font-bold h-6 w-6 rounded-full flex items-center justify-center ' + (day.isToday ? 'bg-[#C85A32] text-white' : 'text-[#6E6259] dark:text-[#9E9287]')}>
                        {day.dayNumber}
                      </span>
                      {day.events.length > 0 && (
                        <span className="text-[10px] font-mono text-[#9C6328] dark:text-[#C8935A] hidden sm:inline">
                          {day.events.reduce((acc, ev) => acc + (ev.durationHours || 0), 0).toFixed(1)}h
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                      {day.events.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          draggable={ev.type !== 'past_log'}
                          onDragStart={() => handleDragStart(ev.id)}
                          onClick={() => setSelectedEvent(ev)}
                          style={{ backgroundColor: ev.color + '22', borderColor: ev.color }}
                          className="px-1.5 py-0.5 rounded border text-[10px] font-medium text-[#132219] dark:text-[#F5F1E9] truncate cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-between gap-1"
                        >
                          <span className="truncate">{ev.type === 'past_log' ? 'Done ' : ''}{ev.title}</span>
                          <span className="font-mono text-[9px] opacity-75 shrink-0">{ev.durationHours}h</span>
                        </div>
                      ))}
                      {day.events.length > 3 && (
                        <div className="text-[9px] text-[#9C6328] dark:text-[#C8935A] font-semibold text-center">+{day.events.length - 3} more</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {viewMode === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekData.map((day, idx) => (
                <div
                  key={idx}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDropOnDate(day.dateStr)}
                  className={'p-4 rounded-xl border flex flex-col space-y-3 min-h-[300px] ' + (day.isToday ? 'bg-[#C85A32]/8 border-[#C85A32]/40' : 'bg-[#F5F1E9] dark:bg-[#131B18] border-[#E5DDD0] dark:border-white/[0.08]')}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DDD0] dark:border-white/[0.08]">
                    <div>
                      <span className="text-xs font-serif font-bold text-[#132219] dark:text-[#F5F1E9] block">{day.dayName}</span>
                      <span className="text-[11px] text-[#6E6259] dark:text-[#9E9287] font-mono">{day.dateStr}</span>
                    </div>
                    <span className={'text-xs font-mono font-bold h-7 w-7 rounded-full flex items-center justify-center ' + (day.isToday ? 'bg-[#C85A32] text-white' : 'bg-[#EFE9DF] dark:bg-[#1A2521] text-[#132219] dark:text-[#F5F1E9]')}>
                      {day.dayNumber}
                    </span>
                  </div>
                  <div className="space-y-2 flex-1">
                    {day.events.map((ev) => (
                      <div
                        key={ev.id}
                        draggable={ev.type !== 'past_log'}
                        onDragStart={() => handleDragStart(ev.id)}
                        onClick={() => setSelectedEvent(ev)}
                        style={{ backgroundColor: ev.color + '20', borderColor: ev.color }}
                        className="p-2.5 rounded-lg border text-xs text-[#132219] dark:text-[#F5F1E9] space-y-1 cursor-pointer hover:scale-[1.02] transition-transform"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-serif font-bold truncate">{ev.title}</span>
                          <span className="text-[10px] font-mono opacity-80 shrink-0">{ev.startTime}-{ev.endTime}</span>
                        </div>
                        {ev.topic && <p className="text-[11px] text-[#6E6259] dark:text-[#9E9287] truncate">{ev.topic}</p>}
                        <div className="flex items-center justify-between text-[10px] opacity-75 pt-1">
                          <span>{ev.subject}</span>
                          <span className="font-mono">{ev.durationHours} hrs</span>
                        </div>
                      </div>
                    ))}
                    {day.events.length === 0 && (
                      <div className="h-full flex items-center justify-center text-[#9E9287] text-xs italic py-8">No study scheduled</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {viewMode === 'day' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between p-4 bg-[#F5F1E9] dark:bg-[#131B18] rounded-xl border border-[#E5DDD0] dark:border-white/[0.08]">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#132219] dark:text-[#F5F1E9]">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                  <p className="text-xs text-[#6E6259] dark:text-[#9E9287]">{dayEvents.length} scheduled sessions Â· {dayEvents.reduce((acc, ev) => acc + (ev.durationHours || 0), 0).toFixed(1)} hrs total</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#C85A32] hover:bg-[#B34E29] text-white text-xs rounded-xl h-10 px-4 border border-[#B34E29]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add Block</span>
                </Button>
              </div>
              <div className="space-y-3">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    style={{ borderLeftColor: ev.color }}
                    className="p-4 rounded-xl bg-[#F5F1E9] dark:bg-[#131B18] border border-[#E5DDD0] dark:border-white/[0.08] border-l-4 flex items-center justify-between gap-4 cursor-pointer hover:border-[#E5DDD0] dark:hover:border-white/[0.14] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#6E6259] dark:text-[#9E9287]">{ev.startTime} â€“ {ev.endTime}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: ev.color }}>{ev.subject}</span>
                      </div>
                      <h4 className="text-sm font-serif font-bold text-[#132219] dark:text-[#F5F1E9]">{ev.title}</h4>
                      {ev.topic && <p className="text-xs text-[#6E6259] dark:text-[#9E9287]">{ev.topic}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-sm font-bold text-[#9C6328] dark:text-[#C8935A]">{ev.durationHours} hrs</span>
                      {ev.studyRoomUrl && (
                        <a
                          href={ev.studyRoomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#A8C7B5] hover:bg-[#2D5A43]/20"
                          title="Join Study Room"
                        >
                          <Video className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <div className="text-center py-12 text-[#9E9287] text-sm font-serif italic">No study blocks scheduled for this day. Tap &ldquo;Add Block&rdquo; to plan your session.</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60  animate-in fade-in">
          <div className="bg-[#FBF9F5] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-5 right-5 text-[#9E9287] hover:text-[#132219] dark:hover:text-[#F5F1E9] transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: selectedEvent.color }}>
                  {selectedEvent.subject}
                </span>
                <span className="text-xs text-[#6E6259] dark:text-[#9E9287] font-mono">{selectedEvent.date} Â· {selectedEvent.startTime} - {selectedEvent.endTime}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#132219] dark:text-[#F5F1E9]">{selectedEvent.title}</h3>
            </div>
            {selectedEvent.topic && (
              <div className="p-4 rounded-xl bg-[#F5F1E9] dark:bg-[#131B18] border border-[#E5DDD0] dark:border-white/[0.08] space-y-1">
                <span className="text-[11px] font-semibold text-[#6E6259] dark:text-[#9E9287] uppercase tracking-wide">Study Topic</span>
                <p className="text-sm text-[#132219] dark:text-[#F5F1E9] font-medium">{selectedEvent.topic}</p>
              </div>
            )}
            {selectedEvent.notes && (
              <div className="p-4 rounded-xl bg-[#F5F1E9] dark:bg-[#131B18] border border-[#E5DDD0] dark:border-white/[0.08] space-y-1">
                <span className="text-[11px] font-semibold text-[#6E6259] dark:text-[#9E9287] uppercase tracking-wide">Notes & Objectives</span>
                <p className="text-xs text-[#132219] dark:text-[#F5F1E9] leading-relaxed">{selectedEvent.notes}</p>
              </div>
            )}
            <div className="space-y-3 pt-2">
              <a
                href={generateGoogleCalendarUrl(selectedEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl bg-[#2D5A43] hover:bg-[#234734] text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Add to My Google Calendar</span>
              </a>
              {selectedEvent.studyRoomUrl && (
                <a
                  href={selectedEvent.studyRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-[#9C6328] hover:bg-[#874F1A] text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Video className="h-4 w-4" />
                  <span>Start / Join Virtual Study Room</span>
                </a>
              )}
              {selectedEvent.type !== 'past_log' && (
                <Button
                  variant="outline"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="w-full h-12 border-rose-400/30 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Remove This Study Block</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60  animate-in fade-in">
          <div className="bg-[#FBF9F5] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-5 right-5 text-[#9E9287] hover:text-[#132219] dark:hover:text-[#F5F1E9] transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-[#132219] dark:text-[#F5F1E9]">Add Study Block</h3>
              <p className="text-xs text-[#6E6259] dark:text-[#9E9287]">Plan a new study session or assignment.</p>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6E6259] dark:text-[#9E9287] font-medium">Title</Label>
                <Input
                  placeholder="e.g. Physics Optics Revision"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="bg-white dark:bg-[#131B18] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F5F1E9] placeholder:text-[#9E9287] text-sm h-11 rounded-xl focus-visible:ring-[#C85A32]/40"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6E6259] dark:text-[#9E9287] font-medium">Subject</Label>
                  <select
                    value={newEvent.subject}
                    onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                    className="w-full bg-white dark:bg-[#131B18] border border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F5F1E9] rounded-xl px-3 h-11 text-xs focus:ring-1 focus:ring-[#C85A32]/40"
                  >
                    <option value={sub1}>{sub1}</option>
                    <option value={sub2}>{sub2}</option>
                    <option value={sub3}>{sub3}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6E6259] dark:text-[#9E9287] font-medium">Date</Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="bg-white dark:bg-[#131B18] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F5F1E9] text-xs h-11 rounded-xl focus-visible:ring-[#C85A32]/40"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6E6259] dark:text-[#9E9287] font-medium">Start Time</Label>
                  <Input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="bg-white dark:bg-[#131B18] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F5F1E9] text-xs h-11 rounded-xl focus-visible:ring-[#C85A32]/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6E6259] dark:text-[#9E9287] font-medium">End Time</Label>
                  <Input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="bg-white dark:bg-[#131B18] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F5F1E9] text-xs h-11 rounded-xl focus-visible:ring-[#C85A32]/40"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6E6259] dark:text-[#9E9287] font-medium">Specific Topic / Paper (Optional)</Label>
                <Input
                  placeholder="e.g. 2019 Past Paper Essay Question 3"
                  value={newEvent.topic}
                  onChange={(e) => setNewEvent({ ...newEvent, topic: e.target.value })}
                  className="bg-white dark:bg-[#131B18] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F5F1E9] placeholder:text-[#9E9287] text-xs h-11 rounded-xl focus-visible:ring-[#C85A32]/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6E6259] dark:text-[#9E9287] font-medium">Notes (Optional)</Label>
                <Input
                  placeholder="Goals or reminders for this study session"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  className="bg-white dark:bg-[#131B18] border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F5F1E9] placeholder:text-[#9E9287] text-xs h-11 rounded-xl focus-visible:ring-[#C85A32]/40"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#C85A32] hover:bg-[#B34E29] text-white font-serif font-bold rounded-xl border border-[#B34E29] shadow-sm text-sm mt-4 transition-colors"
              >
                Save Study Block
              </Button>
            </form>
          </div>
        </div>
      )}

      {isSubjectColorsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60  animate-in fade-in">
          <div className="bg-[#FBF9F5] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setIsSubjectColorsOpen(false)} className="absolute top-5 right-5 text-[#9E9287] hover:text-[#132219] dark:hover:text-[#F5F1E9] transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-[#132219] dark:text-[#F5F1E9]">Subject Calendar Colors</h3>
              <p className="text-xs text-[#6E6259] dark:text-[#9E9287]">Choose your favourite colour for each subject on the calendar.</p>
            </div>
            <div className="space-y-5">
              {[sub1, sub2, sub3].map((subName) => (
                <div key={subName} className="p-4 rounded-xl bg-[#F5F1E9] dark:bg-[#131B18] border border-[#E5DDD0] dark:border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-serif font-bold text-[#132219] dark:text-[#F5F1E9]">{subName}</span>
                    <span className="h-4 w-4 rounded-full border border-[#E5DDD0] dark:border-white/[0.08]" style={{ backgroundColor: subjectColors[subName] || '#039be5' }} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {GCAL_COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => handleUpdateSubjectColor(subName, col.hex)}
                        title={col.name}
                        style={{ backgroundColor: col.hex }}
                        className={'h-7 w-7 rounded-full transition-transform ' + (subjectColors[subName] === col.hex ? 'ring-2 ring-[#132219] dark:ring-[#F5F1E9] ring-offset-2 ring-offset-[#F5F1E9] dark:ring-offset-[#131B18] scale-110' : 'hover:scale-105')}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setIsSubjectColorsOpen(false)} className="w-full h-12 bg-[#132219] dark:bg-[#F5F1E9] hover:bg-[#1A2E21] dark:hover:bg-[#EFE9DF] text-[#FBF9F5] dark:text-[#132219] font-serif font-bold rounded-xl text-sm transition-colors">Done</Button>
          </div>
        </div>
      )}

      {isCountdownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60  animate-in fade-in">
          <div className="bg-[#FBF9F5] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setIsCountdownModalOpen(false)} className="absolute top-5 right-5 text-[#9E9287] hover:text-[#132219] dark:hover:text-[#F5F1E9] transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-1 text-center">
              <span className="text-xs font-medium px-3 py-1 rounded bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20">{countdown.examName}</span>
              <h3 className="text-2xl font-serif font-bold text-[#132219] dark:text-[#F5F1E9] pt-2">A/L Exam Countdown</h3>
              <p className="text-xs text-[#6E6259] dark:text-[#9E9287]">Target Date: {countdown.formattedDate}</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#F5F1E9] dark:bg-[#131B18] border border-[#E5DDD0] dark:border-white/[0.08] text-center space-y-2">
              <span className="font-mono font-extrabold text-5xl sm:text-6xl text-[#C85A32] tracking-tight block">{countdown.daysRemaining}</span>
              <span className="text-xs font-serif font-bold text-[#9C6328] dark:text-[#C8935A] uppercase tracking-widest block">Days Remaining</span>
              <div className="flex justify-center gap-6 pt-3 text-xs text-[#6E6259] dark:text-[#9E9287] border-t border-[#E5DDD0] dark:border-white/[0.08]">
                <span><strong className="text-[#132219] dark:text-[#F5F1E9]">{countdown.weeksRemaining}</strong> Weeks</span>
                <span><strong className="text-[#132219] dark:text-[#F5F1E9]">{countdown.hoursRemaining.toLocaleString()}</strong> Hours</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleDownloadLockscreenWidget}
                className="w-full h-14 bg-[#132219] hover:bg-[#1A2E21] dark:bg-[#F5F1E9] dark:hover:bg-[#EFE9DF] text-[#FBF9F5] dark:text-[#132219] font-serif font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Lockscreen Wallpaper</span>
              </Button>
              <p className="text-[11px] text-[#9E9287] text-center">High-resolution wallpaper image with your countdown and study goals.</p>
            </div>
          </div>
        </div>
      )}

      {isAiScheduleConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60  animate-in fade-in">
          <div className="bg-[#FBF9F5] dark:bg-[#17201D] border border-[#E5DDD0] dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <button onClick={() => setIsAiScheduleConfirmOpen(false)} className="absolute top-5 right-5 text-[#9E9287] hover:text-[#132219] dark:hover:text-[#F5F1E9] transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-2 text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#A8C7B5] flex items-center justify-center mx-auto border border-[#2D5A43]/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#132219] dark:text-[#F5F1E9]">Generate Smart AI Timetable</h3>
              <p className="text-xs text-[#6E6259] dark:text-[#9E9287] leading-relaxed">
                This will create a balanced 35-hour weekly study schedule across <strong className="text-[#132219] dark:text-[#F5F1E9]">{sub1}</strong>, <strong className="text-[#132219] dark:text-[#F5F1E9]">{sub2}</strong>, and <strong className="text-[#132219] dark:text-[#F5F1E9]">{sub3}</strong>.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsAiScheduleConfirmOpen(false)} className="flex-1 h-12 rounded-xl border-[#E5DDD0] dark:border-white/[0.08] text-[#6E6259] dark:text-[#9E9287] hover:bg-[#F5F1E9] dark:hover:bg-[#131B18]">Cancel</Button>
              <Button onClick={handleGenerateAiSchedule} className="flex-1 h-12 bg-[#2D5A43] hover:bg-[#234734] text-white font-serif font-bold rounded-xl border border-[#234734] shadow-sm transition-colors">Generate Timetable</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
