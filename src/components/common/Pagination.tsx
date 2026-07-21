import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemLabel?: string;
  isRTL?: boolean;
  isEn?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemLabel,
  isRTL: customIsRTL,
  isEn: customIsEn,
  className = '',
  style = {},
}: PaginationProps) {
  let isEn = false;

  try {
    const { state } = useApp();
    isEn = customIsEn !== undefined ? customIsEn : state?.language === 'en';
  } catch (e) {
    isEn = customIsEn !== undefined ? customIsEn : false;
  }

  const isRTL = customIsRTL !== undefined ? customIsRTL : !isEn;

  if (!totalPages || totalPages <= 1) return null;

  const startIndex = itemsPerPage ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = (itemsPerPage && totalItems) 
    ? Math.min(currentPage * itemsPerPage, totalItems) 
    : 0;

  const defaultLabel = isEn ? 'items' : 'عنصر';
  const label = itemLabel || defaultLabel;

  let infoText = '';
  if (totalItems !== undefined && itemsPerPage !== undefined) {
    infoText = isEn
      ? `Showing ${startIndex + 1} - ${endIndex} of ${totalItems} ${label}`
      : `عرض ${startIndex + 1} - ${endIndex} من ${totalItems} ${label}`;
  } else {
    infoText = isEn
      ? `Page ${currentPage} of ${totalPages}`
      : `صفحة ${currentPage} من ${totalPages}`;
  }

  return (
    <div
      className={`sa-pagination ad-pagination ${className}`}
      dir={isEn ? 'ltr' : 'rtl'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderTop: '1px solid var(--line)',
        marginTop: 12,
        flexWrap: 'wrap',
        gap: 12,
        ...style,
      }}
    >
      {/* Detail Range / Page Info Text */}
      <span style={{ fontSize: '13px', color: 'var(--text2)' }}>
        {infoText}
      </span>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Previous Button */}
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {isEn ? (
            <>
              <ChevronLeft size={14} />
              <span>Previous</span>
            </>
          ) : (
            <>
              <ChevronRight size={14} />
              <span>السابق</span>
            </>
          )}
        </button>

        {/* Page Counter Badge (e.g. 1 / 5) */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            fontSize: '13px',
            fontWeight: '700',
            color: '#fff',
          }}
        >
          {currentPage} / {totalPages}
        </span>

        {/* Next Button */}
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {isEn ? (
            <>
              <span>Next</span>
              <ChevronRight size={14} />
            </>
          ) : (
            <>
              <span>التالي</span>
              <ChevronLeft size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
