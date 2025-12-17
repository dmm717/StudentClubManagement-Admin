/**
 * PageWrapper - component UI dùng để bọc nội dung trang,
 * đảm bảo max-width 100% và tránh overflow ngang.
 * (Tương tự các component UI trong components/ui của SWP-391)
 */
const PageWrapper = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`page-wrapper animate-fade-in ${className}`}
      style={{
        maxWidth: '100%',
        overflowX: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default PageWrapper;


