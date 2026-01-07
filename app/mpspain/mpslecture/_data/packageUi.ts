export type PackageUi = {
  lecturePackageId: number; // DB lecture_package.id (1~4)
  badge: string;            // 상단 라벨
  shortDesc: string;        // 리스트 짧은 설명
  highlight?: string;       // 강조 문구
  description: string;      // 상세 설명
  muscles: string[];
  goal: string;

  // ✅ 추가
  imageSrc: string;
  imageAlt?: string;
};

export const PACKAGE_UI: PackageUi[] = [
  {
    lecturePackageId: 1,
    badge: 'MPS PACKAGE A',
    shortDesc: '턱관절 · 안면부 · 견관절 · 경추부 핵심 강의',
    highlight: '턱관절 · 안면부 · 견관절 · 경추부',
    description: '턱관절, 안면부, 견관절, 경추부에 관한 MPS - A 강의가 들어있습니다.',
    muscles: ['흉쇄유돌근', '내익상근', '외익상근', '견갑거근', '사각근', '극상근', '극하근'],
    goal:
      '턱관절과 안면부, 견관절, 경추부에 있는 근육과 그 주변 구조물을 촉지하고 이해함으로써 MPS - A 실습에 필요한 지식을 습득하고 실제로 캠프 현장에서 실습해봅니다. 더 나아가 실제 진료현장에서 환자들에게 사용해 봄으로써 MPS의 효능을 경험해보는 것을 목표로 합니다.',
    imageSrc: '/상품이미지테스트용.jpg',
    imageAlt: 'MPS PACKAGE A 이미지',
  },
  {
    lecturePackageId: 2,
    badge: 'MPS PACKAGE B',
    shortDesc: '요추부 · 하지부(허벅지) 집중 강의',
    highlight: '요추부 · 하지부(허벅지)',
    description: '요추부와 하지부(허벅지)에 관한 MPS - A 강의가 들어있습니다.',
    muscles: ['장요근', '요방형근', '중둔근', '대퇴사두근', '슬건근'],
    goal:
      '요추부와 하지부(허벅지)에 있는 근육과 그 주변 구조물을 촉지하고 이해함으로써 MPS - A 실습에 필요한 지식을 습득하고 실제로 캠프 현장에서 실습해봅니다. 더 나아가 실제 진료현장에서 환자들에게 사용해 봄으로써 MPS의 효능을 경험해보는 것을 목표로 합니다.',
    imageSrc: '/상품이미지테스트용.jpg',
    imageAlt: 'MPS PACKAGE B 이미지',
  },
  {
    lecturePackageId: 3,
    badge: 'MPS PACKAGE C',
    shortDesc: '흉부 · 상완 · 주관절 · 하지(무릎 아래) 통합 강의',
    highlight: '흉부 · 상완 · 주관절 · 하지(무릎 아래)',
    description: '흉부, 상완, 주관절, 하지(무릎 아래)에 관한 MPS - A 강의가 들어있습니다.',
    muscles: ['회외근', '대흉근', '후경골근', '전경골근'],
    goal:
      '흉부, 상완, 주관절, 하지(무릎 아래)에 있는 근육과 그 주변 구조물을 촉지하고 이해함으로써 MPS - A 실습에 필요한 지식을 습득하고 실제로 캠프 현장에서 실습해봅니다. 더 나아가 실제 진료현장에서 환자들에게 사용해 봄으로써 MPS의 효능을 경험해보는 것을 목표로 합니다.',
    imageSrc: '/상품테스트이미지.jpg',
    imageAlt: 'MPS PACKAGE C 이미지',
  },
  {
    lecturePackageId: 4,
    badge: 'MPS PACKAGE A+B+C',
    shortDesc: 'A, B, C 패키지 전체를 한 번에 구매',
    highlight: '3개 동시 구매 할인',
    description: 'A, B, C 패키지를 묶어서 한 번에 구매하는 구성입니다.',
    muscles: [],
    goal: 'A/B/C 전체 강의를 한 번에 구매합니다.',
    imageSrc: '/상품이미지테스트용.jpg',
    imageAlt: 'MPS PACKAGE A+B+C 이미지',
  },
];

export const getUiById = (id: number) =>
  PACKAGE_UI.find((x) => x.lecturePackageId === id);
