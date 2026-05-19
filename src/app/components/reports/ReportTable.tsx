import React from 'react';
import { motion } from 'motion/react';
import { Download, Printer, Search, ArrowUpDown, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { cn } from '../../ui/utils';

// --- Reusable Data Table Component ---
interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface ReportTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  onExport?: () => void;
  isLoading?: boolean;
}

export function ReportTable<T extends { id: string }>({ data, columns, title, onExport, isLoading }: ReportTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter(item => 
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        {title && <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>{title}</h3>}
        
        <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-md">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="بحث..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pr-10 pl-4 rounded-xl bg-muted border border-border text-foreground text-sm outline-none focus:border-primary/50 transition-all font-cairo"
            />
          </div>
          {onExport && (
            <button 
              onClick={onExport}
              className="p-2 rounded-xl bg-success/10 border border-success/20 text-success hover:bg-success/20 transition-all"
              title="تصدير"
            >
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right pro-table">
          <thead>
            <tr className="bg-secondary border-b border-border">
              {columns.map((col, i) => (
                <th key={i} className={cn("px-4 py-3 text-xs font-bold text-primary whitespace-nowrap", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-glass-hover transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className={cn("px-4 py-3 text-sm text-foreground whitespace-nowrap", col.className)}>
                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as any)}
                  </td>
                ))}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-2 opacity-20" size={40} />
                  لا توجد بيانات متاحة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            عرض {(currentPage - 1) * itemsPerPage + 1} إلى {Math.min(currentPage * itemsPerPage, filteredData.length)} من {filteredData.length} سجل
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-muted border border-border text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
            <span className="text-sm font-bold text-foreground px-2 flex items-center">{currentPage}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-muted border border-border text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
