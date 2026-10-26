# Fusion Viewer

`DESIGN.md`의 흰 배경, 검은 글씨, 얇은 테두리 스타일을 적용한 Pokémon Infinite Fusion 스프라이트·능력치 뷰어입니다. 한국어를 기본으로 영어와 일본어를 지원합니다.

## 실행

Node.js 22 이상이 필요합니다. 설치할 npm 패키지는 없습니다.

```sh
npm run dev
```

http://127.0.0.1:5173 에서 확인할 수 있습니다.

```sh
npm test             # 계산·검색·데이터 파서·HTTP 서버 테스트
npm run verify-data  # 데이터 전체 검증
npm run build        # dist/에 정적 웹사이트 생성
npm run sync-data    # 외부 DB에서 데이터 갱신 (네트워크 필요)
```

`public/data/`는 외부 DB에서 가져온 데이터 스냅샷입니다. 데이터 갱신 후 다시 빌드하면 됩니다. 이미지는 실제 공식 게임 저장소에서 필요할 때 불러오므로 인터넷 연결이 필요합니다. 데이터 조회에 실패하면 오류와 재시도 동작을 제공하며 임의 데이터를 만들지 않습니다.

## GitHub Pages 배포

1. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
2. 이 소스를 `main` 브랜치에 푸시하면 `.github/workflows/pages.yml`이 테스트·데이터 검증·빌드 후 `dist/`를 배포합니다. Actions에서 수동 실행할 수도 있습니다.
3. 배포 주소는 Actions 실행의 `github-pages` 환경에서 확인합니다.

의존성 설치나 별도 배포 토큰은 필요하지 않습니다. 루트 주소와 `https://계정.github.io/Pokemon-Fusion-Viewer/` 같은 프로젝트 하위 경로를 모두 지원합니다. 워크플로는 커밋된 외부 DB 스냅샷을 사용하므로 데이터 갱신은 `npm run sync-data`로 별도 수행한 후 커밋합니다.

## 기능

- 머리·몸통 포켓몬 선택, 교환, 무작위 조합, 역방향 종족값 비교
- 한국어·영어·일본어 이름, Infinite Fusion 번호 및 전국도감 번호로 포켓몬 검색
- 타입·세대·전설/환상 필터, 이름/종족값 정렬이 있는 선택기
- 종족값 및 실제 능력치: 레벨 1–100, 성격 25개, IV 0–31, 합계 508 이하의 EV 배분 프리셋, 양쪽에서 상속하는 기본 특성 선택(불가사의부적의 HP 1 규칙 포함)
- 직전 설정 또는 고정한 기준과의 변화량을 숫자 위에 작게 표시하는 옵션
- 원본 스프라이트 변형, 제작자 표시, 공식 태그 필터, 도감 정렬·번호별 페이지 이동, 페이지 번호 직접 입력 및 처음/마지막 페이지 이동
- 브라우저에 저장되는 즐겨찾기 및 융합 링크 복사
- 모바일 반응형, 키보드 접근 가능한 선택 대화상자, 이미지 지연 로딩, 검색 전용 Web Worker

언어 드롭다운은 선택 전용입니다. 다른 문자열 드롭다운은 본문을 눌러 텍스트로 검색할 수 있고, 오른쪽 펼치기 버튼을 누르면 입력칸 없이 목록만 엽니다. 레벨·개체값은 숫자를 직접 입력하면 즉시 반영되며, 노력값의 ‘직접 배분’에서 능력치별 값을 입력할 수 있습니다. 입력 범위와 노력값 합계 510 제한을 검증합니다.

일반 검색과 고급 검색의 입력·적용된 조건은 각각 보관됩니다. 일반 검색은 입력을 멈춘 뒤 220ms 후 자동 적용되며, 한글 조합 중에는 검색을 기다립니다. 워커 요청은 한 번에 하나씩 실행하고 대기 중인 요청은 최신 입력으로 대체합니다. 일반 검색에는 별도 검색 버튼이나 최근 검색 목록이 없으며 Enter로도 즉시 적용할 수 있습니다. 고급 검색은 검색식 작성을 마친 뒤 적용 버튼 또는 Ctrl/Cmd+Enter로 실행합니다. 일반 검색은 공백 또는 쉼표로 나눈 단어를 모두 포함하는 융합을 찾습니다. 예를 들어 `피카츄 이상해씨`와 `피카츄, 이상해씨`는 머리·몸통 순서에 관계없이 두 이름을 포함하는 조합을 찾습니다. 각 단어는 초성·부분 이름·다른 언어의 이름으로도 입력할 수 있습니다. 일반 검색에서는 검색식을 해석하지 않습니다. 한국어 설정에서는 선택기, 일반 검색, 고급 검색의 이름 조건에 [hwantage/hansearch](https://github.com/hwantage/hansearch)를 사용하여 초성·혼합 입력 검색을 지원합니다. 원본 알고리즘은 유지하고 UMD 래퍼만 ESM으로 변경한 사본이 `src/vendor/hansearch.mjs`에 있으며, MIT 라이선스와 원본 리비전을 함께 보관합니다.

도감의 기본 스프라이트·태그 집계에는 공식 DB의 `main` 상태만 포함합니다. `alt`·`temp`는 ‘기타 태그’ 화면에서 별도로 조회합니다. 따라서 `reference` 태그여도 `main`이면 기본 도감에 남습니다. 전체 인게임 융합 수는 머리×몸통의 고유 조합 수이며, 변형·기타 이미지를 추가로 더하지 않습니다.

## 고급 검색

도감의 **고급 검색**은 여러 줄 입력과 구문 강조를 지원합니다. **검색 문법**에서 설명과 실행 가능한 예시를 확인할 수 있습니다. Ctrl/Cmd+Enter로 적용할 수 있습니다.

```text
(type:fire OR type:poison)
AND atk:>=80
AND bst:>450
```

| 검색식 | 의미 |
| --- | --- |
| `피카츄` 또는 `name:"리자몽"` | 세 언어의 포켓몬 이름 검색 |
| `type:poison` 또는 `type:독` | 융합된 포켓몬의 타입 |
| `atk:21` | 공격 종족값이 정확히 21 |
| `hp:>=100 AND spe:>80` | 수치 조건 동시 적용 |
| `head:6 body:94` 또는 `id:6.94` | **게임 도감 번호**로 지정 |
| `tag:reference` | 공식 스프라이트 태그 |
| `artist:"sample artist"` | 제작자 이름에 공백을 포함해 검색 |
| `NOT type:water` 또는 `type:!=water` | 타입 제외 |
| `custom:false` | 자동 생성만 검색. 화면의 ‘커스텀만’ 필터도 해제해야 합니다. |

`AND`, `OR`, `NOT`은 대소문자를 구분하지 않습니다. `NOT` → `AND` → `OR` 순서로 계산하며 괄호로 우선순위를 바꿀 수 있습니다. 공백과 줄바꿈으로 나열한 조건은 `AND`로 결합됩니다. `hp`, `atk`, `def`, `spa`, `spd`, `spe`, `bst`는 **종족값**을 의미합니다. 비교 연산자는 `=`, `!=`, `>`, `<`, `>=`, `<=`를 지원합니다. 잘못된 필드·숫자·타입·괄호는 오류로 표시합니다.

도감은 조합당 검색 조건에 일치하는 스프라이트 하나를 표시합니다. 태그 및 제작자 조건은 해당 스프라이트에 적용됩니다. 실험실에서 그 조합의 전체 변형을 볼 수 있습니다.

## 외부 데이터 출처와 버전

게임의 최신 릴리스 전체를 표방하지 않습니다. 이 프로젝트는 **공식 e18 공개 DB의 기본 포켓몬 501종**을 지원하며, 최신 Hoenn 릴리스와 차이가 있을 수 있습니다. 범위와 갱신일은 화면의 ‘데이터 출처’에도 표시됩니다.

- 종족값·게임 ID·타입·폼: [공식 Infinite Fusion e18 species.dat](https://github.com/infinitefusion/infinitefusion-e18/blob/main/Data/species.dat)
- 한국어·영어·일본어 이름, 성격·타입·능력치 이름, 세대/전설 분류: [PokeAPI CSV DB](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv)
- 기본 포켓몬과 융합 이미지: [공식 스프라이트 시트](https://github.com/infinitefusion/infinitefusion-hoenn-public/tree/main/Graphics/CustomBattlers/spritesheets)
- 자동 생성 융합 이미지: [공식 자동 생성 시트](https://github.com/infinitefusion/infinitefusion-hoenn-public/tree/main/Graphics/Battlers/spritesheets_autogen)
- 태그와 제작자: [공식 Sprite Credits.csv](https://github.com/infinitefusion/infinitefusion-hoenn-public/blob/main/Data/sprites/Sprite%20Credits.csv)
- 융합 이름: [공식 SplitNames.rb](https://github.com/infinitefusion/scripts/blob/main/052_InfiniteFusion/Fusion/Data/SplitNames.rb)
- 계산 규칙: [공식 FusedSpecies.rb](https://github.com/infinitefusion/scripts/blob/main/052_InfiniteFusion/Fusion/Data/FusedSpecies.rb)

`catalog.json`의 metadata에 가져온 날짜, URL, SHA-256 해시를 기록합니다. 게임 DB의 Ruby Marshal 데이터는 실행하지 않고 데이터 구조만 해석합니다. 전국도감 번호는 번역 연결에만 사용하고 이미지·융합에는 Infinite Fusion ID를 사용합니다. 원본 DB의 일부 폼 이름은 중복되어 있으므로 선택기에 원본 종 식별자도 표시합니다. 크레딧과 실제 공개 이미지 파일 목록을 대조하여, 파일이 없는 변형은 검색 인덱스에서 제외합니다.

융합 종족값은 머리 우세 항목(HP·특공·특방)과 몸통 우세 항목(공격·방어·스피드)을 원본 코드처럼 **각 항을 따로 버림**하여 더합니다. 레벨·IV·EV·성격 값은 그 종족값에서 계산합니다.

스프라이트는 각 제작자의 작품입니다. Pokémon © Nintendo / Creatures / GAME FREAK. 이 프로젝트는 비공식 팬 도구입니다.
