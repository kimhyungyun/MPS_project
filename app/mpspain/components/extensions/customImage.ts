// app/mpspain/mpschamp/create/extensions/customImage.ts
import { mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';

const CustomImage = Image.extend({
  // ResizeImage가 넣어주는 width/height를 style에 포함해서 HTML로 출력
  renderHTML({ HTMLAttributes }) {
    const attrs: any = { ...HTMLAttributes };
    const styleParts: string[] = [];

    if (attrs.style) {
      styleParts.push(attrs.style as string);
    }

    if (attrs.width) {
      const w =
        typeof attrs.width === 'number'
          ? `${attrs.width}px`
          : `${attrs.width}`;
      styleParts.push(`width: ${w}`);
    }

    if (attrs.height) {
      const h =
        typeof attrs.height === 'number'
          ? `${attrs.height}px`
          : `${attrs.height}`;
      styleParts.push(`height: ${h}`);
    }

    if (styleParts.length) {
      attrs.style = styleParts.join('; ');
    }

    return ['img', mergeAttributes(this.options.HTMLAttributes, attrs)];
  },
});

export default CustomImage;
