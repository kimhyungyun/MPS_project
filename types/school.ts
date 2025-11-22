export const SCHOOL_LIST = [
  '경희대학교',
  '세명대학교',
  '동국대학교',
  '상지대학교',
  '원광대학교',
  '대전대학교',
  '부산대학교',
  '동의대학교',
  '대구한의대학교',
  '동신대학교',
  '우석대학교',
  '가천대학교',
] as const;

export type School = (typeof SCHOOL_LIST)[number];
