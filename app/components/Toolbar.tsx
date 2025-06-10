
// 'use client';

// import { Editor } from '@tiptap/react';

// interface Props {
//   editor: Editor | null;
// }

// const Toolbar = ({ editor }: Props) => {
//   if (!editor) return null;

//   return (
//     <div className="flex flex-wrap gap-2 border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-white/70 backdrop-blur-sm shadow-sm">
//       <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn">
//         굵게
//       </button>
//       <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn">
//         기울임
//       </button>
//       <button onClick={() => editor.chain().focus().toggleStrike().run()} className="btn">
//         취소선
//       </button>
//       <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="btn">
//         왼쪽정렬
//       </button>
//       <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="btn">
//         가운데정렬
//       </button>
//       <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="btn">
//         오른쪽정렬
//       </button>
//       <button onClick={() => {
//         const url = prompt('링크 URL 입력');
//         if (url) {
//           editor.chain().focus().setLink({ href: url }).run();
//         }
//       }} className="btn">링크</button>
//       <button onClick={() => editor.chain().focus().unsetLink().run()} className="btn">링크 제거</button>
//       <button onClick={() => {
//         const url = prompt('이미지 URL 입력');
//         if (url) {
//           editor.chain().focus().setImage({ src: url }).run();
//         }
//       }} className="btn">이미지</button>
//     </div>
//   );
// };

// export default Toolbar;
