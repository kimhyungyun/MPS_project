// data/menuData.ts
import type { MenuItem } from "@/types/menu";

export const menuData: MenuItem[] = [
  {
    title: "MPS 연구회 소개",
    submenu: [
      { title: "원장 및 강사소개", href: "/mpspain/introduction" },
      { title: "MPS란?", href: "/mpspain/introduction/mps" },

    ],
  },
  {
    title: "MPS 회원 광장",
    submenu: [
      //{ title: "정회원 가입 신청", href: "/mpspain/mpschamp/application" },
      { title: "정회원 캠프 안내", href: "/mpspain/mpschamp" },
      //{ title: "문의하기", href: "/mpspain/mpschamp/questionroom" },
      { title: "캠프 자료실", href: "/mpspain/mpschamp/dataroom1" },
    ],
  },

  {
    title: "MPS 동영상 강의",
    submenu: [
      //{ title: "강의 영상", href: "/mpspain/mpslecture/payments" },
      { title: "동영상 강의", href: "/mpspain/mpslecture" },
      { title: "강의 자료실", href: "/mpspain/mpslecture/dataroom2" },

    ],
  },

];
