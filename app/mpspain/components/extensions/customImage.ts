// app/components/extensions/customImage.ts
import Image from '@tiptap/extension-image';

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      // ResizeImage가 넣어주는 width/height attr를 HTML로 같이 내보내기
      width: {
        default: null,
        parseHTML: (element) => {
          const dataWidth = element.getAttribute('data-width');
          if (dataWidth) return dataWidth;

          const styleWidth = (element as HTMLElement).style.width;
          return styleWidth ? styleWidth.replace('px', '') : null;
        },
        renderHTML: (attrs) => {
          const { width } = attrs;
          if (!width) return {};

          return {
            style: `width: ${width}px;`,      // 실제 적용용
            'data-width': width,              // 나중에 parse용
          };
        },
      },

      height: {
        default: null,
        parseHTML: (element) => {
          const dataHeight = element.getAttribute('data-height');
          if (dataHeight) return dataHeight;

          const styleHeight = (element as HTMLElement).style.height;
          return styleHeight ? styleHeight.replace('px', '') : null;
        },
        renderHTML: (attrs) => {
          const { height } = attrs;
          if (!height) return {};

          return {
            style: `height: ${height}px;`,    // 필요하면 사용 (안 쓰면 지워도 됨)
            'data-height': height,
          };
        },
      },
    };
  },
});

export default CustomImage;
