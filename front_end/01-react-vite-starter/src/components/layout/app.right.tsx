// app.left.tsx
const AppRight = ({ className }: { className?: string }) => {
  return (
    <div
      className={className}
      style={{ background: "yellow", bottom: 0, position: "sticky" }}
    >
      this is app right
    </div>
  );
};

// Tương tự cho app.center.tsx và app.right.tsx
export default AppRight;
