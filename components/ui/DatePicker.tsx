'use client';

import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = '选择日期' }: DatePickerProps) {
  return (
    <DayPicker
      mode="single"
      selected={value}
      onSelect={onChange}
      locale={zhCN}
      formatters={{
        formatCaption: (date, options) => format(date, 'yyyy年 MMM月', { ...options, locale: zhCN }),
      }}
      className="rdp"
      styles={{
        root: {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
        },
        head_cell: {
          color: 'var(--text-tertiary)',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
        },
        cell: {
          color: 'var(--text-primary)',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '500',
        },
        day: {
          padding: '0.5rem',
        },
        day_selected: {
          backgroundColor: 'linear-gradient(135deg, #D5546C 0%, #E28B6B 100%)',
          color: 'white',
          fontWeight: '600',
        },
        day_today: {
          borderColor: 'var(--accent-gold)',
        },
        day_range_middle: {
          backgroundColor: 'rgba(213, 84, 108, 0.1)',
        },
        nav_button: {
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent',
          border: 'none',
          padding: '0.5rem',
        },
        nav_button_next: {
          backgroundColor: 'transparent',
        },
        nav_button_previous: {
          backgroundColor: 'transparent',
        },
        caption: {
          color: 'var(--text-primary)',
          fontSize: '1rem',
          fontWeight: '600',
        },
        month_caption: {
          color: 'var(--text-primary)',
        },
      }}
    />
  );
}
