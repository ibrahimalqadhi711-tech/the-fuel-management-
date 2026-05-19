import React from 'react';
import { cn } from '../../ui/utils';

interface FinancialTableProps {
  data: any[];
  title: string;
  subtitle?: string;
  openingBalance: number;
}

export const FinancialTable: React.FC<FinancialTableProps> = ({ data, title, subtitle, openingBalance }) => {
  let runningBalance = openingBalance;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-secondary text-secondary-foreground text-xs uppercase tracking-wider">
              <th className="p-3 border-b border-border">التاريخ</th>
              <th className="p-3 border-b border-border">البيان / التفاصيل</th>
              <th className="p-3 border-b border-border">رقم المرجع</th>
              <th className="p-3 border-b border-border">المركبة/السائق</th>
              <th className="p-3 border-b border-border">منفذ العملية</th>
              <th className="p-3 border-b border-border">مدين (سحب)</th>
              <th className="p-3 border-b border-border">دائن (إيداع)</th>
              <th className="p-3 border-b border-border">الرصيد</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {/* Opening Balance Row */}
            <tr className="bg-muted font-bold border-b border-border">
              <td className="p-3 text-muted-foreground">-</td>
              <td className="p-3 text-primary">رصيد أول المدة</td>
              <td className="p-3">-</td>
              <td className="p-3">-</td>
              <td className="p-3">-</td>
              <td className="p-3 text-red-500">0.00</td>
              <td className="p-3 text-green-600">0.00</td>
              <td className={cn("p-3 font-black", runningBalance >= 0 ? "text-green-600" : "text-red-500")}>
                {runningBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} ر
              </td>
            </tr>

            {data.map((item, idx) => {
              runningBalance += (item.credit || 0) - (item.debit || 0);
              return (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString('ar-SA')}
                    <div className="text-[10px] opacity-50">{new Date(item.created_at).toLocaleTimeString('ar-SA')}</div>
                  </td>
                  <td className="p-3 max-w-xs truncate" title={item.description}>
                    <div className="font-medium text-foreground">{item.description}</div>
                    {item.transaction_details?.station_name && (
                      <div className="text-[10px] text-muted-foreground">{item.transaction_details.station_name}</div>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs text-primary">
                    #{item.id.substring(0, 8)}
                  </td>
                  <td className="p-3">
                    {item.transaction_details?.vehicle_plate ? (
                      <div>
                        <div className="text-foreground">{item.transaction_details.vehicle_plate}</div>
                        <div className="text-[10px] text-muted-foreground">{item.transaction_details.driver_name}</div>
                      </div>
                    ) : "-"}
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {item.created_by_name || "النظام"}
                  </td>
                  <td className="p-3 text-red-500 font-medium">
                    {item.debit > 0 ? (item.debit).toLocaleString(undefined, {minimumFractionDigits: 2}) : "-"}
                  </td>
                  <td className="p-3 text-green-600 font-medium">
                    {item.credit > 0 ? (item.credit).toLocaleString(undefined, {minimumFractionDigits: 2}) : "-"}
                  </td>
                  <td className={cn("p-3 font-bold", runningBalance >= 0 ? "text-green-600" : "text-red-500")}>
                    {runningBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} ر
                  </td>
                </tr>
              );
            })}

            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="p-20 text-center text-muted-foreground">
                  لا توجد حركات مالية في هذه الفترة
                </td>
              </tr>
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot className="bg-secondary font-black text-secondary-foreground">
              <tr>
                <td colSpan={5} className="p-4 text-left">إجمالي الفترة:</td>
                <td className="p-4 text-red-500">
                  {data.reduce((s, i) => s + (i.debit || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td className="p-4 text-green-600">
                  {data.reduce((s, i) => s + (i.credit || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td className={cn("p-4 border-l border-border", runningBalance >= 0 ? "text-green-600" : "text-red-500 text-xl")}>
                  {runningBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} ر
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
