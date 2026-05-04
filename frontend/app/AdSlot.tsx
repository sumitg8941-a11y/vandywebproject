'use client';

interface AdSlotProps {
  className?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical';
}

export default function AdSlot({ className = '', format = 'horizontal' }: AdSlotProps) {
  // In the future, you can replace this with Google AdSense <ins> tag:
  // <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-xxx" data-ad-slot="xxx" data-ad-format="auto" data-full-width-responsive="true"></ins>
  
  return (
    <div className={`w-full flex justify-center my-6 ${className}`}>
      <div 
        className={`bg-gray-100 border border-gray-200 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 
        ${format === 'horizontal' ? 'w-full max-w-4xl h-[90px] md:h-[120px]' : format === 'vertical' ? 'w-[300px] h-[600px]' : 'w-[300px] h-[250px]'}`}
      >
        <span className="text-xs font-bold uppercase tracking-wider mb-1">Advertisement</span>
        <span className="text-[10px] opacity-75">Ad Space Available</span>
      </div>
    </div>
  );
}
