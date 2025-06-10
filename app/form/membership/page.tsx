'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './membership.module.css';

export default function MembershipForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    mb_id: '',
    mb_password: '',
    mb_name: '',
    mb_nick: '',
    mb_email: '',
    mb_hp: '',
    mb_birth: '',
    mb_sex: '',
    mb_addr1: '',
    mb_addr2: '',
    mb_mailling: false,
    mb_sms: false,
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: API 연동
      console.log('회원가입 시도:', formData);
      router.push('/');
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>회원가입</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="mb_id">아이디<span className={styles.required}>*</span></label>
            <input
              type="text"
              id="mb_id"
              name="mb_id"
              value={formData.mb_id}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="mb_password">비밀번호<span className={styles.required}>*</span></label>
            <input
              type="password"
              id="mb_password"
              name="mb_password"
              value={formData.mb_password}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="mb_name">이름<span className={styles.required}>*</span></label>
            <input
              type="text"
              id="mb_name"
              name="mb_name"
              value={formData.mb_name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="mb_nick">닉네임<span className={styles.required}>*</span></label>
            <input
              type="text"
              id="mb_nick"
              name="mb_nick"
              value={formData.mb_nick}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="닉네임을 입력하세요"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="mb_email">이메일<span className={styles.required}>*</span></label>
            <input
              type="email"
              id="mb_email"
              name="mb_email"
              value={formData.mb_email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="mb_hp">휴대폰 번호<span className={styles.required}>*</span></label>
            <input
              type="tel"
              id="mb_hp"
              name="mb_hp"
              value={formData.mb_hp}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="010-0000-0000"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="mb_birth">생년월일</label>
            <input
              type="date"
              id="mb_birth"
              name="mb_birth"
              value={formData.mb_birth}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>성별</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="mb_sex"
                  value="M"
                  checked={formData.mb_sex === 'M'}
                  onChange={handleChange}
                />
                남성
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="mb_sex"
                  value="F"
                  checked={formData.mb_sex === 'F'}
                  onChange={handleChange}
                />
                여성
              </label>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>주소</label>
            <div className={styles.addressGroup}>
              <input
                type="text"
                name="mb_addr1"
                value={formData.mb_addr1}
                onChange={handleChange}
                className={styles.input}
                placeholder="기본주소"
              />
              <input
                type="text"
                name="mb_addr2"
                value={formData.mb_addr2}
                onChange={handleChange}
                className={styles.input}
                placeholder="상세주소"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="mb_mailling"
                  checked={formData.mb_mailling}
                  onChange={handleChange}
                />
                이메일 수신 동의
              </label>
            </div>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="mb_sms"
                  checked={formData.mb_sms}
                  onChange={handleChange}
                />
                SMS 수신 동의
              </label>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}
