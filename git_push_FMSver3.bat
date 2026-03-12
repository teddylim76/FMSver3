@echo off
chcp 65001 >nul
echo ============================================================
echo  장애관리시스템 FMSver3 - GitHub Push Script
echo ============================================================

:: ── 1. 작업 폴더 설정 (필요시 경로 수정) ────────────────────────
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [1/6] 작업 디렉토리: %CD%

:: ── 2. Git 초기화 (이미 되어있으면 무시됨) ──────────────────────
git init
echo [2/6] git init 완료

:: ── 3. 파일 스테이징 ─────────────────────────────────────────────
git add .
echo [3/6] git add . 완료

:: ── 4. 커밋 ──────────────────────────────────────────────────────
git commit -m "feat: FaultManagementSystem ver3 초기 커밋 - React+Firebase 기반 ITS 장애관리시스템"
echo [4/6] git commit 완료

:: ── 5. 원격 저장소 연결 ──────────────────────────────────────────
:: 이미 origin이 등록된 경우 오류 방지를 위해 제거 후 재등록
git remote remove origin 2>nul
git remote add origin https://teddylim76@github.com/teddylim76/FMSver3.git
echo [5/6] remote origin 설정 완료

:: ── 6. main 브랜치로 Push ────────────────────────────────────────
git branch -M main
git push -u origin main
echo [6/6] git push 완료

echo.
echo ============================================================
echo  Push 성공! https://github.com/teddylim76/FMSver3 확인하세요
echo ============================================================
pause
