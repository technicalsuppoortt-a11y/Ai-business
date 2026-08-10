const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\components\\DatePicker.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

// 1. Add dropdownRef declaration
const oldRefsDecl = `  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);`.split('\n').map(l => l.trimEnd()).join(nl);

const newRefsDecl = `  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldRefsDecl)) {
  content = content.replace(oldRefsDecl, newRefsDecl);
  console.log('Added dropdownRef declaration.');
}

// 2. Update handleClickOutside to check dropdownRef
const oldClickOutside = `  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);`.split('\n').map(l => l.trimEnd()).join(nl);

const newClickOutside = `  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target as Node))
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldClickOutside)) {
  content = content.replace(oldClickOutside, newClickOutside);
  console.log('Updated handleClickOutside logic.');
}

// 3. Attach ref={dropdownRef} to the motion.div
const oldMotionDiv = `            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[999999] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 w-72"`.split('\n').map(l => l.trimEnd()).join(nl);

const newMotionDiv = `            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[999999] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 w-72"`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(oldMotionDiv)) {
  content = content.replace(oldMotionDiv, newMotionDiv);
  console.log('Attached ref={dropdownRef} to motion.div.');
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
