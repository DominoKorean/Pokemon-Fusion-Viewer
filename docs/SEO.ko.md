# 검색 노출 및 링크 미리보기

[English technical guide](SEO.md)

사이트 제목·검색 요약문·공유 미리보기 이미지·파비콘·구조화 데이터·사이트맵을 준비했습니다. 핵심 소개는 **모바일 최적화, 수치 변화량 확인, 검색 편의성**입니다.

## 준비된 페이지

- 홈, 퓨전 도감, 트리플 퓨전 안내
- 두 포켓몬 조합 251,001개: `fusion/1.4.html` 형식
- 공식 트리플 조합 23개: `triple/1.4.7.html` 형식
- 포켓몬별 조합 목록: `fusions/`, `fusions/1.html`
- 사이트맵 색인: `sitemap.xml` 및 최대 40,000개 URL씩 나눈 하위 사이트맵 7개
- 실제 사이트 스크린샷을 이용한 1200×630 이미지: `social/preview.jpg`

개별 페이지는 JavaScript 없이도 영어·한국어·일본어 포켓몬 이름과 타입·종족값을 읽을 수 있습니다. JavaScript가 실행되면 해당 조합의 기존 실험실이 열립니다. 두 포켓몬의 순서는 구분하고, 스프라이트 변형은 동일 조합의 대표 주소로 묶습니다. 필터·검색 결과·개인 저장 목록은 별도의 사이트맵 페이지로 만들지 않습니다.

조합 수는 **현재 가져온 DB** 기준이며 최신 팬게임 전체 수록 목록을 뜻하지 않습니다. 조합 페이지가 있다고 커스텀 스프라이트가 있다는 뜻도 아닙니다. 커스텀 이미지가 없으면 기존처럼 게임 자동 생성 이미지를 사용합니다.

## 배포 후 할 일

1. GitHub Pages 배포가 끝나면 아래 주소가 열리는지 확인합니다.
   - [홈](https://dominokorean.github.io/Pokemon-Fusion-Viewer/)
   - [사이트맵](https://dominokorean.github.io/Pokemon-Fusion-Viewer/sitemap.xml)
   - [조합 예시](https://dominokorean.github.io/Pokemon-Fusion-Viewer/fusion/1.4.html)
2. [Google Search Console](https://search.google.com/search-console/)에 **URL 접두어** 속성 `https://dominokorean.github.io/Pokemon-Fusion-Viewer/`를 추가합니다.
3. Google이 발급한 실제 소유 확인 파일을 `public/`에 넣거나, 실제 확인 메타 태그를 루트 `index.html`의 `<head>`에 넣습니다. 메타 태그는 `SEO:START`와 `SEO:END` 사이가 아닌 **바깥쪽**에 넣어야 빌드에 유지됩니다.
4. 확인 파일/태그를 배포한 뒤 소유 확인을 마치고, 사이트맵 메뉴에 `sitemap.xml`을 제출합니다. 주소 25만 개를 개별 제출할 필요는 없습니다.
5. URL 검사에서 홈과 조합 예시의 실제 HTML·대표 URL·수집 상태를 확인합니다.
6. [Bing Webmaster Tools](https://www.bing.com/webmasters/)에도 사이트를 확인하거나 Search Console에서 가져오고 같은 사이트맵을 제출합니다. [네이버 서치어드바이저](https://searchadvisor.naver.com/)는 서비스가 허용하는 사이트 범위로 소유 확인 후 사이트맵을 제출합니다. 네이버에서 저장소 하위 경로 대신 도메인 루트 제어를 요구하면 사용자 Pages 저장소 또는 직접 관리하는 도메인에서 진행해야 합니다.

소유 확인과 검색엔진에 실제 제출하는 작업은 계정에서 별도로 진행해야 합니다. 발급받지 않은 확인 토큰은 넣지 않았습니다. [Google 사이트맵 안내](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [네이버 소유 확인 안내](https://searchadvisor.naver.com/guide/faq-start-register)를 참고하세요.

## robots.txt 주의점

검색엔진이 읽는 파일은 **도메인 루트**의 `https://dominokorean.github.io/robots.txt`입니다. 이 저장소의 `/Pokemon-Fusion-Viewer/robots.txt`를 추가하는 것만으로 루트 정책이 적용되지는 않습니다. 그래서 사이트맵은 webmaster 도구에 직접 제출해야 합니다. 사용자 Pages 저장소를 관리한다면 그 루트 robots.txt에도 이 사이트맵 주소를 추가할 수 있습니다. [공식 배치 규칙](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)

## 수정 및 점검

- 공용 주소·소개 문구·메타데이터: `src/seo.mjs`
- 개별 페이지·사이트맵 생성: `scripts/seo.mjs`
- 공유 카드 원본: `public/social/preview.html`, 실제 스크린샷: `public/social/website.jpg`
- 빌드 결과: `dist/`, 용량·주소 수: `dist/build-report.json`
- 검증: `npm test`, `npm run verify-data`, `npm run build`, `npm run verify-search` (빌드 시 검색 검증 자동 실행)

생성 파일 수가 많아 기존보다 빌드 시간이 늘어납니다. 생성된 조합 HTML은 Git에 넣지 않고 빌드 시 만듭니다. 전체 출력이 950 MB를 넘으면 빌드가 실패해 GitHub Pages의 1 GB 한도 초과를 방지합니다. 로컬 개발 서버는 필요한 페이지를 즉시 생성하므로 전체 빌드가 끝날 때까지 기다리지 않아도 됩니다.

검색엔진은 수집·색인 여부, 결과에 표시할 요약문과 이미지를 직접 결정합니다. 준비한 이미지가 모든 검색 결과에 반드시 나오는 것은 아니며, 공유 이미지도 조합마다 따로 만든 이미지가 아닌 사이트 공용 미리보기입니다. 전체 주소가 색인되거나 특정 순위로 노출된다는 보장은 없습니다. [Google 검색 요약문 안내](https://developers.google.com/search/docs/appearance/snippet)
