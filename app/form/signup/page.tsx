'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { School, SCHOOL_LIST } from '@/types/school';

declare global {
  interface Window {
    daum: any;
  }
}

type SignupFormData = {
  mb_id: string;
  mb_password: string;
  mb_name: string;
  mb_nick: string;
  mb_email: string;
  mb_hp: string;
  mb_sex: string;
  mb_birth: string;
  mb_zip1: string; // 우편번호
  mb_addr1: string;
  mb_addr2: string;
  mb_school: School | '';
  agreePrivacy: boolean; // 개인정보처리방침 동의(필수)
  agreeTerms: boolean; // 이용약관 동의(필수)
};

const TERMS_TEXT = `이용약관
1장 총칙
1조 (목적)
본 약관은 경근근막엠피에스(MPS연구회)(https://mpspain.co.kr) 서비스(이하 '서비스'라 합니다)의 이용과 관련하여 현행 법령에 위반하지 않는 범위 내에서 회원의 기본적인 권리와 책임 및 회사와의 중요 사항을 정하는 것을 목적으로 합니다.
제 2조 (약관의 효력 및 적용과 변경)
(1) 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 회원가입 절차와 서비스 화면에 게시합니다.
(2) 이 약관의 내용은 경근근막엠피에스(MPS연구회) 사이트에 공시함으로써 효력이 발생합니다. 이 약관에 동의하고 회원가입을 한 회원은 약관에 동의한 시점부터 동의한 약관의 적용을 받고 약관의 변경이 있을 경우에는 변경의 효력이 발생한 시점부터 변경된 약관의 적용을 받습니다.
(3) 회사는 약관의 규제에 관한 법률, 전자거래 기본법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 소비자보호법 등 관련법을 위배하지 않고 회원의 정당한 권리를 부당하게 침해하지 않는 범위에서 이 약관을 개정할 수 있습니다.
(4) 회사가 약관을 개정할 경우에는 지체 없이 적용일자 및 주요개정 사유를 명시하여 개정된 약관을 적용하고자 하는 날 (이하 '효력발생일'이라 합니다)로부터 7일 이전에 다음과 같은 방법 중 1가지 이상의 방법으로 회원에게 고지합니다.
1. 사이트 내 게시
2. 회원이 가장 최근에 회사에 제공한 e-mail로 통보
3. 회원가입 시 입력한 이동전화로 SMS(Short Message Service) 통보
4. 일간지 공고 등의 방법
(5) 회원은 변경된 약관의 내용에 동의하지 않을 경우 서비스 이용을 중단하고 회원탈퇴를 할 수 있습니다. 단, 변경된 약관의 효력발생일 이후에도 계속하여 서비스를 이용할 경우에는 변경된 약관의 내용에 동의한 것으로 간주합니다.
(6) 본 조의 통지방법 및 통지의 효력은 본 약관의 각 조항에서 규정하는 개별적인 또는 전체적인 통지의 경우에 이를 준용합니다.
제 3조 (약관 외 준칙)
이 약관에 명시되지 않은 사항에 대해서는 관계법령, 회사가 정한 서비스의 개별이용약관, 세부이용지침 및 규칙 등의 규정을 따르게 됩니다.
제 4조 (용어의 정의)
(1) 회원 : 사이트에 접속하여 이 약관에 동의함으로써 회사와 서비스 이용계약을 체결하고 이용자 ID(이용자고유번호)와 Password(비밀번호)를 발급받은 자를 말합니다.
(2) 이용자 ID(이용자고유번호) : 회원 식별과 서비스 이용을 위하여 회원이 선정하고 회사가 승인하여 부여하는 문자와 숫자의 조합을 말합니다.
(3) PASSWORD(비밀번호) : 서비스 이용 시 이용자 ID와 일치하는 이용자임을 확인하고, 회원의 개인정보 보호를 위하여, 회원 자신이 설정, 관리하는 문자와 숫자의 조합을 말합니다.
(4) 이용자 정보 : 이용자가 회사와 이용 계약 체결 시 회사에 등록하는 이용자 ID, 성명, 주소 등 이용자의 신상에 관련된 정보를 말합니다.
(5) 강의 서비스 : 사이트를 통해 제공되는 강의 서비스를 말하며 그 이용 등에 관한 구체적인 사항은 본 약관 제14조에 기술된 바와 같습니다.

2장 서비스 이용 계약
제 5조 (이용계약의 성립)
이용계약은 사이트 회원으로 등록하길 희망한 자의 이용신청에 대한 회사의 이용 승낙에 의하여 성립합니다.
제 6조 (이용 신청 시 기재 사항)
이용 신청 시 사이트의 회원 가입 화면에서 회사가 요청하는 소정의 정보를 온라인 양식의 신청서에 기재하여야 합니다.
제 7조 (이용신청의 승낙 등)
(1) 회사는 회원이 제6조에서 정한 사항을 정확히 기재하고 본 약관에 동의할 때 서비스의 이용신청을 승낙 합니다.
(2) 회사는 다음 각호의 경우에는 이용신청의 승낙을 유보할 수 있습니다.
1. 기술상 서비스 제공이 불가능한 경우
2. 제6조의 기재사항에 허위, 기재누락, 도용, 오기가 있는 경우
3. 다른 사람 명의로 이용신청을 하였을 때
4. 이용 신청 시 내용을 허위로 기재 하였을 때
5. 이용 신청자가 이전에 회원자격을 상실한 사실이 있는 경우
(3) 회원의 자격에 따라 서비스 이용범위는 세분화 될 수 있습니다.

3장 서비스의 이용
제 8조 (서비스의 이용게시)
(1) 회사는 회원의 이용 신청을 승인한 때부터 서비스를 개시합니다. 단, 유료 서비스를 포함한 일부 서비스의 경우에는 결제가 완료된 이후 또는 회사에서 지정한 일자부터 서비스를 개시합니다.
(2) 회사의 업무상 또는 기술상의 장애로 인하여 서비스를 개시하지 못하는 경우에는 사이트에 공지하거나 회원에게 통지합니다.
제 9조 (서비스의 이용시간)
(1) 서비스의 이용은 연중무휴 1일 24시간을 원칙으로 합니다. 다만, 시스템 점검, 증설과 교체 및 고장 등의 이유로 회사가 정한 기간에는 서비스가 일시 중지될 수 있습니다. 이러한 경우 회사는 사전 또는 사후에 이를 공지합니다.
(2) 회사는 서비스를 일정범위로 분할하여 각 범위 별로 이용 가능한 시간을 별도로 정할 수 있으며 이 경우 그 내용을 공지합니다.
제 10조 (서비스의 변경 및 중지)
(1) 회사는 변경될 서비스의 내용 및 제공일자를 회원에게 통지하고 서비스를 변경하여 제공할 수 있습니다.
(2) 회사는 다음 각 호에 해당하는 경우 서비스의 전부 또는 일부를 제한하거나 중단할 수 있습니다.
1. 서비스용 설비의 확장, 보수 등 공사로 인한 부득이한 경우
2. 회사가 통제하기 곤란한 사정으로 불가피하게 서비스 중단이 필요한 경우
3. 서비스 이용량의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우
4. 새로운 서비스로의 교체 등 회사가 적절하다고 판단하는 경우
5. 기타 정전, 천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우
(3) 회사는 제2항에 의한 서비스 중단의 경우에는 회원에게 그 사실을 사전에 통지합니다. 다만, 회사가 통제할 수 없는 사유로 인한 서비스의 중단으로 인하여 사전 통지가 불가능한 경우에는 예외로 합니다.
(4) 회사는 회사의 고의 또는 중대한 과실로 인하여 서비스가 중단되어 회원이 이미 결제한 유료 서비스를 이용할 수 없을 경우에는 당해 유료 서비스의 잔여기간을 보상하는 방식으로 회원에게 보상합니다.

제 11조 (ID와 PASSWORD의 관리)
(1) 회원은 ID와 PASSWORD를 스스로의 책임하에 관리하여야 하며, 회원이 ID와 PASSWORD를 소홀히 관리하거나 무단양도, 대여 등을 하여 발생하는 손해와 피해의 책임은 회원에게 있으므로 각별히 주의해야 합니다.
(2) 회원은 자신의 ID 및 PASSWORD가 도난, 유출되거나 제3자가 사용하고 있음을 인지한 경우에는 그 사실을 회사에 통지하고 회원의 안내에 따르도록 합니다.
(3) 회사는 사이트 통합, 회사의 중요정책 변경에 따라 ID의 본질적인 부분을 변경하지 아니하는 방법으로 ID를 일괄 변경할 수 있습니다. 이 경우 회사는 사전 그 변경사실을 통지합니다.

제 12조 (회원의 게시물)
(1) 게시물이라 함은 회사의 서비스 내에 회원이 올린 글, 이미지, 각종 파일과 링크, 각종 덧글 등의 정보를 의미합니다.
(2) 회원이 서비스 내에 게시한 게시물로 인해 회원 개인에게 발생하는 손실이나 문제는 회원 개인의 책임이므로, 게시물 작성 시 관련법령에 위배되지 않도록 유의해야 합니다.
(3) 회원은 다음 각 호에 해당하는 게시물을 게시하거나 전달할 수 없으며 회사는 서비스 내에 존재하는 게시물이 다음 각 호에 해당한다고 판단되는 경우 해당 게시물을 삭제, 이동 또는 등록거부 할 수 있습니다. 또한, 회사는 게시물에 관련된 세부 이용지침을 별도로 정하여 시행할 수 있으며, 회원은 그 지침에 따라 각종 게시물을 등록하거나 삭제하여야 합니다.
1. 회사, 다른 회원 또는 제3자를 비방하거나 명예를 손상시키는 내용인 경우
2. 공공질서 및 미풍양속에 위반되는 내용을 유포하는 경우
3. 범죄적 행위에 결부된다고 인정되는 내용인 경우
4. 회사의 저작권, 제3자의 저작권 등 기타 권리를 침해하는 내용인 경우
5. 법령을 위반하거나 타인의 권리를 침해하는 방식으로 정치적, 종교적 분쟁을 야기하는 경우
6. 불필요하거나 승인되지 않은 광고, 판촉물을 게재하는 경우
7. 타인의 개인정보를 도용, 사칭하여 작성한 내용이거나, 타인이 입력한 정보를 무단으로 위·변조한 내용인 경우
8. 동일한 내용을 중복하여 다수 게시하는 등 게시의 목적에 어긋나는 경우
9. 기타 관계 법령 및 회사의 지침 등에 위반된다고 판단되는 경우
(4) 본 조 제3항 각 호에 해당하는 게시물을 게재하여 회사로부터 경고를 받은 회원의 경우 다음 각 호의 규정에 따라 서비스 이용이 제한될 수 있습니다.
1. 첫 번째 경고 : 관련 게시글 삭제, 2주 간 게시글 등록 불가
2. 두 번째 경고 : 관련 게시글 삭제, 4주 간 게시글 등록 불가
3. 세 번째 경고 : 관련 게시글 삭제, 영구 게시글 등록 불가

제 13조 (게시물의 저작권 등)
(1) 이용자가 서비스 내에 게시한 게시물의 저작권은 저작권법에 의해 보호를 받습니다. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
(2) 이용자는 자신이 게시한 게시물을 회사가 국내외에서 다음 각 호의 목적으로 사용하는 것을 허락합니다.
1. 서비스 내에서 이용자 게시물의 복제, 전송, 전시, 배포 및 우수 게시물을 서비스 화면에 노출하기 위하여 이용자 게시물의 크기를 변환하거나 단순화하는 등의 방식으로 수정하는 것
2. 회사에서 운영하는 관련 사이트의 서비스 내에서 이용자 게시물을 전시, 배포하는 것. 단 회원이 전시, 배포에 동의하지 아니할 경우, 회사는 관련 사이트의 서비스 내에서 당해 회원의 게시물을 전시, 배포하지 않습니다.
3. 회사의 서비스를 홍보하기 위한 목적으로 미디어, 통신사 등에게 이용자의 게시물 내용을 보도, 방영하게 하는 것. 단 이 경우 회사는 회원의 개별 동의 없이 미디어, 통신사 등에게 개인정보를 제공하지 않습니다.
(3) 전항의 규정에도 불구하고, 회사가 이용자의 게시물을 전항 각 호에 기재된 목적 이외에 상업적 목적 (예 : 제3자에게 게시물을 제공하고 금전적 대가를 지급받는 경우 등)으로 사용할 경우에는 사전에 해당 이용자로부터 동의를 얻어야 합니다. 게시물에 대한 회사의 사용 요청, 이용자의 동의 및 동의철회는 전화, 전자우편, 팩스 등 회사가 요청하는 방식에 따릅니다. 이 경우 회사는 게시물의 출처를 표시하며 게시물의 사용에 동의한 해당 이용자에게 별도의 보상을 제공합니다.
(4) 회원이 탈퇴를 하거나 제19조 제2항에 의하여 회원 자격을 상실한 경우에 본인 계정에 기록된 게시물은 삭제됩니다. 다만 제3자에게 의하여 스크랩, 펌, 담기 등으로 다시 게시된 게시물과 공용 서비스 내에 기록된 게시물 등 다른 이용자의 정상적인 서비스 이용에 필요한 게시물은 삭제되지 않습니다.
(5) 회사는 회사의 합병, 영업양도, 회사가 운영하는 사이트간의 통합 등의 사유로 원래의 게시물의 내용을 변경하지 않고 게시물의 게시 위치를 변경할 수 있습니다.

제 14조 (강의 서비스 이용관련)
(1) 회원은 회사가 다양한 주제에 대한 강사의 강의 및 해설 등을 제공하는 강의 서비스를 이용할 수 있습니다.
(2) 강의 서비스는 유료로 제공될 수 있으며 이 경우 그 요금과 사용조건, 결제방법 등은 별도 고지하는 절차에 따릅니다.
(3) 강의 서비스 이용의 승인 시기는 회사가 별도 고지하지 않는 한 회원이 강의 서비스 이용을 신청하는 즉시 개시됩니다.
(4) 일부 강의 서비스는 별도의 동영상 재생 프로그램이나 어플리케이션 등을 설치해야 이용할 수 있습니다. 회사는 그 이용조건 등을 설치 시 별도 고지합니다.

4장 계약당사자의 의무
제 15조 (회사의 의무)
(1) 회사는 관계 법령과 이 약관이 금지하거나 미풍 양속에 반하는 행위를 하지 않으며, 이 약관이 정하는 바에 따라 지속적이고 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.
(2) 회사는 안정적인 서비스의 제공을 위하여, 설비에 장애가 생기거나 손상된 때에는 부득이한 사유가 없는 한 이를 지체 없이 수리 또는 복구합니다.
(3) 회사는 회원의 개인정보 보호와 안전한 서비스 제공을 위하여 최선을 다합니다.
(4) 회사는 회원의 개인정보를 본인의 승낙 없이 타인에게 누설, 배포하거나 제3자에게 배포, 제공하지 않습니다. 다만, 적법한 절차를 거친 국가기관의 요구나 수사상 또는 기타 공익을 위하여 필요하다고 인정되는 경우는 예외로 합니다. 회사는 관련법령이 정하는 바에 따라서 회원 등록정보를 포함한 회원의 개인정보를 보호하기 위하여 노력하며 회원의 개인정보보호에 관해서는 관련법령 및 회사가 정하는 '개인정보보호정책'에 정한 바에 의합니다.
(5) 회사는 이용자로부터 서비스 이용과 관련되어 제기되는 의견이나 불만이 정당하다고 인정되는 경우 이를 즉시 처리하여야 합니다. 다만, 즉시 처리가 어려운 경우 이용자에게 그 사유와 처리 일정을 통보하여야 합니다.

제 16조 (회원의 의무)
(1) 회사의 명시적 동의가 없는 한 회원의 이용권한은 회원 개인에 한정되며, 타인에게 양도, 증여하거나 이를 담보로 제공할 수 없습니다.
(2) 회원은 서비스 이용 시 다음 각 호의 행위를 하여서는 안됩니다.
1. 회원은 이용 신청 또는 변경 시 허위 사실을 기재하거나, 자신 또는 다른 회원의 ID 및 개인정보를 이용, 공유하는 행위를 할 수 없습니다.
2. 회원은 회사가 제공하는 서비스를 통하여 얻은 정보를 상업적 목적으로 이용하거나 출판, 방송, 복제, 전송, 공유 등을 통하여 회사의 허락 없이 제3자에 노출, 제공하는 행위를 할 수 없습니다. 단, 공익의 목적이나 회원의 이익을 위하여 필요한 경우에는 회사에게 협의를 요청하고 사전 동의를 구하도록 합니다.
3. 회원은 제3자의 권리나 저작권 등을 침해하는 행위를 할 수 없습니다.
4. 회원은 회사에서 공식적으로 인정한 경우를 제외하고는 서비스를 이용하여 상품 또는 용역을 판매하는 영업 활동 등의 상행위를 할 수 없으며, 특히 해킹, ID공유 등의 방법을 통해 회사의 서비스를 제3자에게 제공, 공유, 노출 시키거나 판매하는 행위를 할 수 없습니다.
5. 회원은 회사의 사이트 운영을 저해하거나 다른 이용자의 서비스 이용을 방해하거나 회사의 운영진, 직원 또는 관계자를 사칭하는 행위를 할 수 없습니다.
6. 회원은 공서양속을 저해하는 부호, 문자, 음성, 음향 및 영상 등의 정보를 타인에게 유포시키는 행위를 할 수 없습니다.
7. 회원은 포인트를 제3자와 유상거래 하거나 현금으로 전환하는 행위를 할 수 없습니다.
(3) 회원은 서비스의 이용을 위해 자신의 이용자 정보를 관리해야 하며 제6조의 등록사항에 변경이 있을 경우 회사가 제공하는 서비스 내의 개인정보 수정 페이지를 통하여 변경 사항을 지체 없이 알려야 합니다.

5장 계약해지 및 이용제한
제 17조 (계약해지 및 이용제한)
(1) 회원은 회사가 제공하는 서비스 내의 회원탈퇴 기능을 통하여 언제라도 탈퇴를 요청할 수 있습니다. 회사는 제10조 제2항 각호와 같은 불가피한 사정이 없는 한 회원의 탈퇴 요청을 지체 없이 처리합니다.
(2) 회원이 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우, 회사는 당해 회원에게 사전 통지를 한 후, 서비스 이용권한을 일정기간 제한하거나 이용권한을 상실시킬 수 있습니다. 단, 회사가 회원이 이용권한을 상실시키기 위해서는 회원이 이를 시정하거나 소명할 수 있는 기회를 부여해야 합니다.

제 18조 (양도 금지)
(1) 회원은 서비스의 이용권한, 기타 이용 계약상 지위를 타인에게 양도, 증여할 수 없으며 게시물에 대한 저작권을 포함한 모든 권리 및 책임은 이를 게시한 회원에게 있습니다.
(2) 회사가 제3자에게 합병, 분할합병 되거나 서비스를 제3자에게 양도함으로써 서비스의 제공 주체가 변경되는 경우, 회사는 사전에 회원에게 통지합니다. 이 경우 합병, 분할 서비스 표준약관 합병, 서비스 양도에 반대하는 회원은 서비스 이용계약을 해지할 수 있습니다.

6장 손해배상 등
제 19조 (손해배상)
(1) 회사는 고의 또는 중대한 과실에 의하여 회원에게 손해를 입힌 경우, 그 손해를 배상할 책임이 있습니다.
(2) 회사가 서비스를 제공하는 과정에 있어 고의 또는 중대한 과실로 서비스 장애나 오류가 발생하였을 경우, 아래 각 호의 내용으로 회원의 손해에 대하여 보상합니다.
1. 회사는 시스템 점검, 증설과 교체 등 회사가 정한 기간 외에 고의 또는 중대한 과실로 예고 없이 전체 서비스가 일시 중단될 경우 유료 서비스 이용기간을 연장하는 방법으로 회원에게 보상합니다.
2. 회사의 과실로 회원이 결제한 유료 서비스를 이용할 수 없는 상황이 발생할 경우, 회사는 해당 유료 서비스의 복원, 교환 또는 환불 조치를 통해 회원에게 보상합니다.
(3) 회원이 서비스를 이용함에 있어 행한 불법적 행위와 본 약관의 규정을 위반함으로 인하여 회사에 손해가 발생하거나 제3자로부터 회사가 손해배상 청구 또는 각종 이의제기를 받는 경우, 당해 회원은 회사에 발생하는 손해를 배상하여야 합니다.

제 20조 (면책사항)
(1) 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
(2) 회사는 회원의 귀책사유로 인한 서비스의 이용장애에 대하여 책임을 지지 않습니다.
(3) 회사는 회원이 회사에서 제공하는 서비스로부터 기대되는 이익을 얻지 못하였거나 서비스 자료에 대한 취사선택 또는 이용으로 발생하는 손해 등에 대해서는 책임이 면제됩니다.
(4) 회사는 제3자가 사이트에 저장, 게시 또는 전송한 정보·자료·사실의 신뢰도 및 정확성 등 내용에 대하여는 책임을 지지 않습니다.
(5) 회사는 사이트에 입점, 연결되어 있는 제3자의 웹사이트(이하 '링크 사이트'라 합니다)가 있는 경우, 회원이 링크 사이트를 이용함에 따라 발생하는 문제에 대하여는 책임을 지지 않습니다.

제 21조 (재판권 및 준거법)
(1) 서비스 이용 중 발생한 회원과 회사간의 소송은 민사소송법 상의 관할법원에 제기합니다.
(2) 회사와 이용자간에 제기된 소송에는 대한민국국법을 적용합니다.
`;

const PRIVACY_TEXT = `개인정보처리방침
1. 총칙
"경근근막엠피에스(MPS연구회)"는 이용자들의 개인정보보호를 매우 중요시하며, 이용자가 회사의 서비스를 이용함과 동시에 온라인상에서 회사에 제공한 개인정보가 보호 받을 수 있도록 최선을 다하고 있습니다. 이에 "경근근막엠피에스(MPS연구회)"는 통신비밀보호법, 전기통신사업법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 정보통신서비스제공자가 준수하여야 할 관련 법규상의 개인정보보호 규정 및 정보통신부가 제정한 개인정보보호지침을 준수하고 있습니다. "경근근막엠피에스(MPS연구회)"는 개인정보 취급방침을 통하여 이용자들이 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려 드립니다.
"경근근막엠피에스(MPS연구회)"의 개인정보 취급방침은 정부의 법률 및 지침 변경이나 "경근근막엠피에스(MPS연구회)"의 내부 방침 변경 등으로 인하여 수시로 변경될 수 있고, 이에 따른 개인정보 취급방침의 지속적인 개선을 위하여 필요한 절차를 정하고 있습니다. 그리고 개인정보 취급방침을 개정하는 경우나 개인정보 취급방침 변경될 경우 쇼핑몰의 첫 페이지의 개인정보취급방침을 통해 고지하고 있습니다. 이용자들께서는 사이트 방문 시 수시로 확인하시기 바랍니다.

2. 개인정보 수집에 대한 동의
"경근근막엠피에스(MPS연구회)"는 귀하께서 "경근근막엠피에스(MPS연구회)"의 개인정보보호방침 또는 이용약관의 내용에 대해 「동의합니다」버튼 또는 「동의하지 않습니다」버튼을 클릭할 수 있는 절차를 마련하여, 「동의합니다」버튼을 클릭하면 개인정보 수집에 대해 동의한 것으로 봅니다.

3. 개인정보의 수집목적 및 이용목적
"개인정보"라 함은 생존하는 개인에 관한 정보로서 당해 정보에 포함되어 있는 성명, 휴대폰번호 등의 사항에 의하여 당해 개인을 식별할 수 있는 정보(당해 정보만으로는 특정 개인을 식별할 수 없더라도 다른 정보와 용이하게 결합하여 식별할 수 있는 것을 포함)를 말합니다. 대부분의 서비스는 별도의 사용자 등록이 없이 언제든지 사용할 수 있습니다. 그러나 "경근근막엠피에스(MPS연구회)"는 회원서비스를 통하여 이용자들에게 맞춤식 서비스를 비롯한 보다 더 향상된 양질의 서비스를 제공하기 위하여 다음과 같은 목적으로 이용자 개인의 정보를 수집 · 이용하고 있습니다.
- 이름, 아이디, 비밀번호, 성별, 학교, 생년월일 : 회원제 서비스 이용에 따른 본인 확인 절차에 이용
- 이메일, 휴대폰번호 : 고지사항 전달, 불만처리 등을 위한 원활한 의사소통 경로의 확보, 새로운 서비스 및 신상품이나 이벤트 정보 등의 안내
- 기타 선택항목(우편번호, 주소) : 개인맞춤 서비스를 제공하기 위한 자료
- IP Address : 불량회원의 부정 이용 방지와 비인가 사용 방지
기타 위 수집된 정보를 이용하여 서비스 제공에 관한 계약이행 및 요금정산, 회원관리, 마케팅 및 광고에 활용하고 있습니다.

4. 수집하는 개인정보 항목 및 수집방법
"경근근막엠피에스(MPS연구회)"는 이용자들이 회원서비스를 이용하기 위해 회원으로 가입하실 때 서비스 제공을 위한 필수적인 정보들을 온라인상에서 입력 받고 있습니다. <회원가입> 아이디, 비밀번호, 이름, 닉네임, 성별, 생년월일, 이메일, 주소, 핸드폰번호, 전화번호 또한 쇼핑몰 내에서의 설문조사나 이벤트 행사 시 통계분석이나 경품제공 등을 위해 선별적으로 개인정보 입력을 요청할 수 있습니다. 그러나, 이용자의 기본적 인권 침해의 우려가 있는 민감한 개인정보(인종 및 민족, 사상 및 신조, 출신지 및 본적지, 정치적 성향 및 범죄기록, 건강상태 및 성생활 등)는 수집하지 않으며 부득이하게 수집해야 할 경우 이용자들의 사전동의를 반드시 구할 것입니다. 그리고, 어떤 경우에라도 입력하신 정보를 이용자들에게 사전에 밝힌 목적 이외에 다른 목적으로는 사용하지 않으며 이용자의 사전 동의 없이는 이용자의 개인 정보를 외부에로 공개 · 유출하지 않습니다.

5. 개인정보 자동수집 장치의 설치, 운영 및 그 거부에 관한 사항
"경근근막엠피에스(MPS연구회)"는 이용자들에게 특화된 맞춤서비스를 제공하기 위해서 이용자의 정보를 저장하고 수시로 불러오는 세션(session)방식을 사용하고 있습니다.
- 세션이란? 세션은 쇼핑몰을 운영하는데 이용되는 서버가 이용자의 로그인 시간 동안에 이용자의 정보를 서버에 저장합니다. 세션정보는 이용자가 로그아웃 시 자동으로 삭제됩니다.
- 세션의 설치/운영 및 거부 이용자는 세션 설치에 대한 선택권을 가지고 있지 않습니다. 로그인이 필요한 서비스의 경우 쇼핑몰 운영 서버에서 자동으로 세션이 생성됩니다.

6. 수집한 개인정보 공유 및 제공
"경근근막엠피에스(MPS연구회)"는 이용자들의 개인정보를 "3. 개인정보의 수집목적 및 이용목적"에서 고지한 범위 내에서만 사용하며, 이용자의 사전 동의 없이는 동 범위를 초과하여 이용하거나 이용자의 개인정보를 외부에 공개하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
- 이용자들이 사전에 공개에 동의한 경우
- 서비스 제공에 관한 계약을 이행하기 위하여 필요한 개인정보로서 경제적 · 기술적인 사유로 통상적인 동의를 받는 것이 뚜렷하게 곤란한 경우
- 서비스 제공에 따른 요금정산을 위하여 필요한 경우
- 자사 서비스를 이용하여 타인에게 정신적, 물질적 피해를 줌으로써 그에 대한 법적인 조치를 취하기 위하여 개인정보를 공개해야 한다고 판단되는 충분한 근거가 있는 경우
- 기타 법에 의해 요구된다고 판단되는 경우 (ex. 관련법에 의거 적법한 절차에 의한 정부/수사기관의 요청이 있는 경우 등)
- 통계작성, 학술연구나 시장조사를 위하여 특정개인을 식별할 수 없는 형태로 광고주, 협력업체나 연구단체 등에 제공하는 경우

7. 개인정보의 열람, 정정, 삭제
이용자가 원할 경우 언제라도 "경근근막엠피에스(MPS연구회)"에서 개인정보를 열람하실 수 있으며 보관된 필수 정보를 수정하실 수 있습니다. 또한 회원 가입 시 요구된 필수 정보 외의 추가 정보는 언제나 열람, 수정, 삭제할 수 있습니다. 이용자의 개인정보 변경 및 삭제와 회원탈퇴는 당사의 고객센터에서 로그인(Login) 후 이용하실 수 있습니다.

8. 개인정보의 보유기간 및 이용기간
이용자가 쇼핑몰 회원으로서 회사에 제공하는 서비스를 이용하는 동안 "경근근막엠피에스(MPS연구회)"는 이용자들의 개인정보를 계속적으로 보유하며 서비스 제공 등을 위해 이용합니다. 다만, 위 "7. 개인정보의 열람, 정정, 삭제" 에서 설명한 절차와 방법에 따라 이용자 본인이 직접 삭제하거나 수정한 정보, 가입해지를 요청한 경우에는 재생할 수 없는 방법에 의하여 디스크에서 완전히 삭제하며 추후 열람이나 이용이 불가능한 상태로 처리됩니다. 그리고 "4. 수집하는 개인정보 항목 및 수집방법" 에서와 같이 일시적인 목적 (설문조사, 이벤트, 본인확인 등)으로 입력 받은 개인정보는 그 목적이 달성된 이후에는 동일한 방법으로 사후 재생이 불가능한 상태로 처리됩니다.
이용자의 개인정보는 다음과 같이 개인정보의 수집목적 또는 제공받은 목적이 달성되면 파기하는 것을 원칙으로 합니다. 그리고 상법, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계법령의 규정에 의하여 보존할 필요가 있는 경우 "경근근막엠피에스(MPS연구회)"는 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다. 이 경우 "경근근막엠피에스(MPS연구회)"는 보관하는 정보를 그 보관의 목적으로만 이용하며 보존기간은 아래와 같습니다.
- 계약 또는 청약철회 등에 관한 기록 : 5년
- 대금결제 및 재화 등의 공급에 관한 기록 : 5년
- 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년
"경근근막엠피에스(MPS연구회)"는 귀중한 이용자의 개인정보를 안전하게 처리하며, 유출의 방지를 위하여 다음과 같은 방법을 통하여 개인정보를 파기합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다. 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.

9. 게시물 보호
"경근근막엠피에스(MPS연구회)"는 이용자의 게시물을 소중하게 생각하며 변조, 훼손, 삭제되지 않도록 최선을 다하여 보호합니다. 그러나 다음의 경우는 그렇지 아니합니다.
- 스팸(spam)성 게시물 (예 : 행운의 편지, 8억 메일, 특정사이트 광고 등)
- 타인을 비방할 목적으로 허위 사실을 유포하여 타인의 명예를 훼손하는 글
- 타인의 저작권 등 권리를 침해하는 내용, 기타 게시판 주제와 다른 내용의 게시물
- "경근근막엠피에스(MPS연구회)"는 바람직한 게시판 문화를 활성화하기 위하여 동의 없는 타인의 신상 공개시 특정부분을 삭제하거나 기호 등으로 수정하여 게시할 수 있습니다.
- 다른 주제의 게시판으로 이동 가능한 내용일 경우 해당 게시물에 이동 경로를 밝혀 오해가 없도록 하고 있습니다.
- 그 외의 경우 명시적 또는 개별적인 경고 후 삭제 조치할 수 있습니다.
근본적으로 게시물에 관련된 제반 권리와 책임은 작성자 개인에게 있습니다. 또 게시물을 통해 자발적으로 공개된 정보는 보호받기 어려우므로 정보 공개 전에 심사숙고 하시기 바랍니다.

10. 수집한 개인정보의 위탁
"경근근막엠피에스(MPS연구회)"는 서비스 향상을 위해서 귀하의 개인정보를 필요한 경우 동의 등 법률상의 요건을 구비하여 외부에 수집 · 취급 · 관리 등을 위탁하여 처리할 있으며, 제 3자에게 제공할 수 있습니다. "경근근막엠피에스(MPS연구회)"는 개인정보의 처리와 관련하여 아래와 같이 업무를 위탁하고 있으며, 관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다. 또한 공유하는 정보는 당해 목적을 달성하기 위하여 필요한 최소한의 정보에 국한됩니다.
위탁 대상자 : [토츠 페이먼츠]
위탁업무 내용 : [카드결제 대행]

11. 이용자의 권리와 의무
이용자의 개인정보를 최신의 상태로 정확하게 입력하여 불의의 사고를 예방해 주시기 바랍니다. 이용자가 입력한 부정확한 정보로 인해 발생하는 사고의 책임은 이용자 자신에게 있으며 타인 정보의 도용 등 허위정보를 입력할 경우 회원자격이 상실될 수 있습니다. 이용자는 개인정보를 보호받을 권리와 함께 스스로를 보호하고 타인의 정보를 침해하지 않을 의무도 가지고 있습니다. 비밀번호를 포함한 이용자의 개인정보가 유출되지 않도록 조심하시고 게시물을 포함한 타인의 개인정보를 훼손하지 않도록 유의해 주십시오. 만약 이 같은 책임을 다하지 못하고 타인의 정보 및 존엄성을 훼손할 시에는 『정보통신망이용촉진 및 정보보호 등에 관한 법률』등에 의해 처벌 받을 수 있습니다.

12. 개인정보 관련 의견수렴 및 불만처리에 관한 사항
"경근근막엠피에스(MPS연구회)"는 개인정보보호와 관련하여 이용자 여러분들의 의견을 수렴하고 있으며 불만을 처리하기 위하여 모든 절차와 방법을 마련하고 있습니다. 이용자들은 하단에 명시한 "13. 개인정보관리 책임자 및 담당자" 항을 참고하여 전화나 메일을 통하여 불만사항을 신고할 수 있고, 당사는 이용자들의 신고사항에 대하여 신속하고도 충분한 답변을 해 드릴 것입니다.

13. 개인정보관리 책임자 및 담당자
소속 / 직위　: 개인정보관리책임자
E-M A I L 　 : pimang_235@naver,com
전 화 번 호　: 010-7942-5854

15. 아동의 개인정보보호
"경근근막엠피에스(MPS연구회)"는 온라인 환경에서 만 14세 미만 어린이의 개인정보를 보호하는 것 역시 중요한 일이라고 생각하고 있습니다. "경근근막엠피에스(MPS연구회)"는 만 14세 미만의 어린이들은 법정대리인의 동의가 없는 한 회원으로 가입할 수 없게 하고 있습니다.

15. 고지의 의무
현 개인정보취급방침의 내용은 정부의 정책 또는 보안기술의 변경에 따라 내용의 추가 삭제 및 수정이 있을 시에는 홈페이지의 '공지사항'을 통해 고지할 것입니다.
개인정보취급방침 시행일자: 2026-01-01
`;

export default function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    mb_id: '',
    mb_password: '',
    mb_name: '',
    mb_nick: '',
    mb_email: '',
    mb_hp: '',
    mb_sex: '',
    mb_birth: '',
    mb_zip1: '',
    mb_addr1: '',
    mb_addr2: '',
    mb_school: '',
    agreePrivacy: false,
    agreeTerms: false,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isNickChecked, setIsNickChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [nickCheckMessage, setNickCheckMessage] = useState('');

  const [policyTab, setPolicyTab] = useState<'terms' | 'privacy'>('terms');

  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length > 11) return value;
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'mb_id') {
      setIsIdChecked(false);
      setIdCheckMessage('');
    }
    if (name === 'mb_nick') {
      setIsNickChecked(false);
      setNickCheckMessage('');
    }

    if (name === 'mb_hp') {
      const formattedValue = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'mb_school') {
      setFormData((prev) => ({ ...prev, mb_school: value as School | '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handlePostcodeSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('우편번호 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        const addr =
          data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

        setFormData((prev) => ({
          ...prev,
          mb_zip1: data.zonecode,
          mb_addr1: addr,
          mb_addr2: '',
        }));
      },
    }).open();
  };

  const validateForm = () => {
    if (!formData.mb_id) return setError('아이디를 입력해주세요.'), false;
    if (formData.mb_id.length < 4 || formData.mb_id.length > 20)
      return setError('아이디는 4~20자 사이여야 합니다.'), false;
    if (!isIdChecked) return setError('아이디 중복확인을 해주세요.'), false;

    if (!formData.mb_password) return setError('비밀번호를 입력해주세요.'), false;
    if (formData.mb_password.length < 6 || formData.mb_password.length > 20)
      return setError('비밀번호는 6~20자 사이여야 합니다.'), false;

    if (!formData.mb_name) return setError('이름을 입력해주세요.'), false;

    if (!formData.mb_nick) return setError('닉네임을 입력해주세요.'), false;
    if (!isNickChecked) return setError('닉네임 중복확인을 해주세요.'), false;

    if (!formData.mb_email) return setError('이메일을 입력해주세요.'), false;
    if (!formData.mb_email.includes('@'))
      return setError('올바른 이메일 형식이 아닙니다.'), false;

    if (!formData.mb_hp) return setError('휴대폰 번호를 입력해주세요.'), false;
    const phoneNumber = formData.mb_hp.replace(/[^\d]/g, '');
    if (phoneNumber.length !== 11)
      return setError('올바른 휴대폰 번호 형식이 아닙니다.'), false;

    if (!formData.mb_school) return setError('학교를 선택해주세요.'), false;

    // ✅ 필수 동의 2개 모두 체크
    if (!formData.agreeTerms)
      return setError('이용약관 동의(필수)에 체크해주세요.'), false;

    if (!formData.agreePrivacy)
      return setError('개인정보 수집 · 이용 동의(필수)에 체크해주세요.'), false;

    return true;
  };

  const handleCheckId = async () => {
    setError('');
    setIdCheckMessage('');

    if (!formData.mb_id) return setError('아이디를 먼저 입력해주세요.'), undefined;
    if (formData.mb_id.length < 4 || formData.mb_id.length > 20)
      return setError('아이디는 4~20자 사이여야 합니다.'), undefined;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL is not defined');
        setError('서버 설정에 문제가 있습니다.');
        return;
      }

      const res = await axios.get(`${apiUrl}/api/auth/check-id`, {
        params: { mb_id: formData.mb_id },
      });

      if (res.data.available) {
        setIsIdChecked(true);
        setIdCheckMessage(res.data.message || '사용 가능한 아이디입니다.');
      } else {
        setIsIdChecked(false);
        setIdCheckMessage(res.data.message || '이미 사용 중인 아이디입니다.');
      }
    } catch (err: any) {
      console.error('Check ID error:', err);
      setIsIdChecked(false);
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('아이디 중복 확인에 실패했습니다.');
    }
  };

  const handleCheckNick = async () => {
    setError('');
    setNickCheckMessage('');

    if (!formData.mb_nick) return setError('닉네임을 먼저 입력해주세요.'), undefined;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL is not defined');
        setError('서버 설정에 문제가 있습니다.');
        return;
      }

      const res = await axios.get(`${apiUrl}/api/auth/check-nick`, {
        params: { mb_nick: formData.mb_nick },
      });

      if (res.data.available) {
        setIsNickChecked(true);
        setNickCheckMessage(res.data.message || '사용 가능한 닉네임입니다.');
      } else {
        setIsNickChecked(false);
        setNickCheckMessage(res.data.message || '이미 사용 중인 닉네임입니다.');
      }
    } catch (err: any) {
      console.error('Check Nick error:', err);
      setIsNickChecked(false);
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('닉네임 중복 확인에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL is not defined');
        setError('서버 설정에 문제가 있습니다.');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`${apiUrl}/api/auth/signup`, formData);

      if (response.data.success) {
        alert(response.data.message);
        router.push('/form/login');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.response?.status === 404)
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      else if (err.response?.status === 409)
        setError('이미 사용 중인 아이디입니다.');
      else if (err.response?.status === 500)
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      else setError('회원가입에 실패했습니다. 입력한 정보를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 아이디 + 중복확인 */}
            <div>
              <label
                htmlFor="mb_id"
                className="block text-sm font-medium text-gray-700"
              >
                아이디 *
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="mb_id"
                  name="mb_id"
                  type="text"
                  required
                  minLength={4}
                  maxLength={20}
                  value={formData.mb_id}
                  onChange={handleChange}
                  className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="4~20자 사이의 아이디를 입력하세요"
                />
                <button
                  type="button"
                  onClick={handleCheckId}
                  className="px-3 py-2 text-sm font-medium border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  중복확인
                </button>
              </div>
              {idCheckMessage && (
                <p
                  className={`mt-1 text-xs ${
                    isIdChecked ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {idCheckMessage}
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="mb_password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_password"
                  name="mb_password"
                  type="password"
                  required
                  minLength={6}
                  maxLength={20}
                  value={formData.mb_password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="6~20자 사이의 비밀번호를 입력하세요"
                />
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label
                htmlFor="mb_name"
                className="block text-sm font-medium text-gray-700"
              >
                이름 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_name"
                  name="mb_name"
                  type="text"
                  required
                  value={formData.mb_name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="이름을 입력하세요"
                />
              </div>
            </div>

            {/* 닉네임 + 중복확인 */}
            <div>
              <label
                htmlFor="mb_nick"
                className="block text-sm font-medium text-gray-700"
              >
                닉네임 *
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="mb_nick"
                  name="mb_nick"
                  type="text"
                  required
                  value={formData.mb_nick}
                  onChange={handleChange}
                  className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="닉네임을 입력하세요"
                />
                <button
                  type="button"
                  onClick={handleCheckNick}
                  className="px-3 py-2 text-sm font-medium border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  중복확인
                </button>
              </div>
              {nickCheckMessage && (
                <p
                  className={`mt-1 text-xs ${
                    isNickChecked ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {nickCheckMessage}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label
                htmlFor="mb_email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_email"
                  name="mb_email"
                  type="email"
                  required
                  value={formData.mb_email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            {/* 휴대폰 */}
            <div>
              <label
                htmlFor="mb_hp"
                className="block text-sm font-medium text-gray-700"
              >
                휴대폰 번호 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_hp"
                  name="mb_hp"
                  type="tel"
                  required
                  maxLength={13}
                  value={formData.mb_hp}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            {/* 성별 */}
            <div>
              <label
                htmlFor="mb_sex"
                className="block text-sm font-medium text-gray-700"
              >
                성별
              </label>
              <div className="mt-1">
                <select
                  id="mb_sex"
                  name="mb_sex"
                  value={formData.mb_sex}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">선택하세요</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
            </div>

            {/* 학교 선택 */}
            <div>
              <label
                htmlFor="mb_school"
                className="block text-sm font-medium text-gray-700"
              >
                학교 *
              </label>
              <div className="mt-1">
                <select
                  id="mb_school"
                  name="mb_school"
                  required
                  value={formData.mb_school}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">학교를 선택하세요</option>
                  {SCHOOL_LIST.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 생년월일 */}
            <div>
              <label
                htmlFor="mb_birth"
                className="block text-sm font-medium text-gray-700"
              >
                생년월일
              </label>
              <div className="mt-1">
                <input
                  id="mb_birth"
                  name="mb_birth"
                  type="text"
                  placeholder="YYYYMMDD"
                  value={formData.mb_birth}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* 우편번호 + 검색 버튼 */}
            <div>
              <label
                htmlFor="mb_zip1"
                className="block text-sm font-medium text-gray-700"
              >
                우편번호
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="mb_zip1"
                  name="mb_zip1"
                  type="text"
                  value={formData.mb_zip1}
                  onChange={handleChange}
                  className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="우편번호"
                  readOnly
                />
                <button
                  type="button"
                  onClick={handlePostcodeSearch}
                  className="px-3 py-2 text-sm font-medium border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  우편번호 검색
                </button>
              </div>
            </div>

            {/* 기본주소 */}
            <div>
              <label
                htmlFor="mb_addr1"
                className="block text-sm font-medium text-gray-700"
              >
                기본주소
              </label>
              <div className="mt-1">
                <input
                  id="mb_addr1"
                  name="mb_addr1"
                  type="text"
                  value={formData.mb_addr1}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="기본주소"
                  readOnly
                />
              </div>
            </div>

            {/* 상세주소 */}
            <div>
              <label
                htmlFor="mb_addr2"
                className="block text-sm font-medium text-gray-700"
              >
                상세주소
              </label>
              <div className="mt-1">
                <input
                  id="mb_addr2"
                  name="mb_addr2"
                  type="text"
                  value={formData.mb_addr2}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="상세주소를 입력하세요"
                />
              </div>
            </div>

            {/* ✅ 약관/개인정보 스크롤 박스 + 동의 체크 2개 */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPolicyTab('terms')}
                  className={`px-3 py-1 text-xs rounded-md border ${
                    policyTab === 'terms'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  이용약관
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyTab('privacy')}
                  className={`px-3 py-1 text-xs rounded-md border ${
                    policyTab === 'privacy'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  개인정보처리방침
                </button>
              </div>

              <div className="border rounded-md bg-gray-50 p-3 h-40 overflow-y-auto text-xs text-gray-700 whitespace-pre-line">
                {policyTab === 'terms' ? TERMS_TEXT : PRIVACY_TEXT}
              </div>

              <div className="mt-3 space-y-2">
                <label className="flex items-start gap-2">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreeTerms: e.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    이용약관 동의 (필수)
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    id="agreePrivacy"
                    name="agreePrivacy"
                    type="checkbox"
                    checked={formData.agreePrivacy}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreePrivacy: e.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    개인정보 수집 · 이용 동의 (필수)
                  </span>
                </label>

                <p className="text-xs text-gray-500">
                  * 이용약관/개인정보처리방침 모두 동의해야 회원가입이 가능합니다.
                </p>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div>
              <button
                type="submit"
                disabled={
                  isLoading || !formData.agreeTerms || !formData.agreePrivacy
                }
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '처리중...' : '가입하기'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <a
                href="/form/login"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                로그인
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
