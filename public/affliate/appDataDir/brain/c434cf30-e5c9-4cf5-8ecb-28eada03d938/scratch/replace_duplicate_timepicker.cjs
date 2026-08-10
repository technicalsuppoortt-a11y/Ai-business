const fs = require('fs');
const filepath = 'd:\\Froent_end_Courses\\FreeLancer\\joepartner-portal\\src\\pages\\tabs\\BookingSection.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const isCrLf = content.includes('\r\n');
const nl = isCrLf ? '\r\n' : '\n';

// 1. Remove the newly added one from the lower position
const newTimePickerBlock = `interface TimePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
}

function TimePickerInput({ value, onChange, disabled = false, className = "" }: TimePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center" });
    }
  }, [isOpen]);

  const displayLabel = formatTo12Hour(value) || value;

  return (
    <div ref={containerRef} className={\`relative \${className}\`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-700 dark:text-slate-200 text-center font-bold hover:border-purple-300 dark:hover:border-purple-700 disabled:opacity-50 transition cursor-pointer"
      >
        {displayLabel}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto p-1 py-1.5">
          {timeOptions15.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                ref={isSelected ? activeRef : undefined}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={\`w-full text-center px-2 py-1 text-[10px] font-bold rounded-lg transition-all \${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                }\`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}`.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(newTimePickerBlock)) {
  content = content.replace(newTimePickerBlock, '');
  console.log('Removed duplicate TimePickerInput.');
} else {
  // Try normalized replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normNewTimePickerBlock = newTimePickerBlock.replace(/\r\n/g, '\n');
  if (normContent.includes(normNewTimePickerBlock)) {
    const startIdx = normContent.indexOf(normNewTimePickerBlock);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normNewTimePickerBlock.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount);
    content = lines.join(nl);
    console.log('Removed duplicate TimePickerInput (normalized approach).');
  } else {
    console.log('Could not find duplicate TimePickerInput block!');
  }
}

// 2. Replace the old placeholder TimePickerInput (lines 254-279)
const oldTimePickerBlock = `interface TimePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
}

const TimePickerInput: React.FC<TimePickerInputProps> = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <CustomSelect
      value={value}
      onChange={(val) => onChange(val as string)}
      options={timeOptions}
      disabled={disabled}
      className={className}
      placeholder="9:00 AM"
      icon={<ClockIcon className="w-4 h-4 text-slate-400" />}
    />
  );
};`.split('\n').map(l => l.trimEnd()).join(nl);

const replacementTimePickerBlock = `interface TimePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
}

function TimePickerInput({ value, onChange, disabled = false, className = "" }: TimePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center" });
    }
  }, [isOpen]);

  const displayLabel = formatTo12Hour(value) || value;

  return (
    <div ref={containerRef} className={\`relative \${className}\`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-700 dark:text-slate-200 text-center font-bold hover:border-purple-300 dark:hover:border-purple-700 disabled:opacity-50 transition cursor-pointer"
      >
        {displayLabel}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto p-1 py-1.5">
          {timeOptions15.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                ref={isSelected ? activeRef : undefined}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={\`w-full text-center px-2 py-1 text-[10px] font-bold rounded-lg transition-all \${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                }\`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}`;

const targetOldBlock = oldTimePickerBlock.split('\n').map(l => l.trimEnd()).join(nl);
const replacementOldBlock = replacementTimePickerBlock.split('\n').map(l => l.trimEnd()).join(nl);

if (content.includes(targetOldBlock)) {
  content = content.replace(targetOldBlock, replacementOldBlock);
  console.log('Replaced placeholder TimePickerInput with custom component.');
} else {
  // Try normalized replacement
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = oldTimePickerBlock.split('\n').map(l => l.trimEnd()).join('\n');
  if (normContent.includes(normTarget)) {
    const startIdx = normContent.indexOf(normTarget);
    const startLineIdx = normContent.substring(0, startIdx).split('\n').length - 1;
    const blockLinesCount = normTarget.split('\n').length;
    const lines = content.split(/\r?\n/);
    lines.splice(startLineIdx, blockLinesCount, ...replacementTimePickerBlock.split('\n').map(l => l.trimEnd()));
    content = lines.join(nl);
    console.log('Replaced placeholder TimePickerInput with custom component (normalized approach).');
  } else {
    console.log('Could not find placeholder TimePickerInput block to replace.');
  }
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Done!');
