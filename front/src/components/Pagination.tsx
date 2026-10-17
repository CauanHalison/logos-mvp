import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div style={styles.paginationBar}>
      <span style={styles.paginationText}>
        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalItems} ocorrências no total)
      </span>

      <div style={styles.pageButtons}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || disabled}
        >
          <ChevronLeft size={16} /> Anterior
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || disabled}
        >
          Próxima <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  paginationBar: {
    padding: '16px 20px',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101726',
    flexWrap: 'wrap',
    gap: '12px',
  },
  paginationText: {
    fontSize: '0.8125rem',
    color: '#94a3b8',
  },
  pageButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

export default Pagination;
