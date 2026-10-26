<div align="center">

<img src="docs/images/website-preview.jpg" width="960" alt="레지기가스와 불카모스의 퓨전 스프라이트와 능력치를 보여주는 Fusion Viewer 웹 화면">

<h1>Fusion Viewer</h1>

<p><a href="README.md">English</a> &nbsp; · &nbsp; <strong>한국어</strong> &nbsp; · &nbsp; <a href="README.ja.md">日本語</a></p>

<p><strong>모바일 최적화 · 수치 변화량 확인 · 편리한 검색</strong></p>

<p>Pokémon Infinite Fusion의 스프라이트와 능력치를 간결하게 살펴보는 뷰어.<br>웹사이트는 영어가 기본이며 한국어와 일본어도 지원합니다.</p>

<p>
  <a href="https://dominokorean.github.io/Pokemon-Fusion-Viewer/"><strong>사이트 바로가기 ↗</strong></a>
  &nbsp; · &nbsp;
  <a href="#기능">기능</a>
  &nbsp; · &nbsp;
  <a href="#검색">검색 문법</a>
  &nbsp; · &nbsp;
  <a href="#로컬-실행">로컬 실행</a>
</p>

</div>

## 기능

| | 할 수 있는 것 |
| --- | --- |
| **퓨전 실험실** | 머리·몸통 선택, 각각 무작위 선택, 교환, 역방향 퓨전 비교. 브라우저 뒤로·앞으로 가기로 이전 조합과 변형 복원. |
| **스프라이트** | 제작자 정보가 있는 공식 커스텀 변형을 보고, 커스텀이 없으면 자동 생성 스프라이트 확인. |
| **능력치** | 레벨·성격·개체값·노력값·상속 특성을 설정해 종족값과 실제 능력치 비교. |
| **퓨전 도감** | 타입·스프라이트 태그 필터, 결과 정렬, 페이지 번호 직접 입력으로 이동. |
| **검색** | 입력 즉시 검색, 여러 이름 조합, 구문 강조가 있는 여러 줄 고급 검색. |
| **저장·공유** | 브라우저에 퓨전을 북마크하고 선택한 조합·스프라이트의 링크 복사. |
| **언어** | 영어·한국어·일본어 전환 및 선택한 언어 기억. |

작은 화면에서도 정보를 충분히 볼 수 있도록 컨트롤과 카드를 간결하게 배치했습니다. 포켓몬 선택기의 검색·필터는 결과 수에 관계없이 고정되고, 결과만 스크롤됩니다. 작은 스프라이트에는 부드러운 축소 렌더링을 적용했습니다. 스프라이트는 필요할 때 불러오고, 도감 검색은 Web Worker에서 처리해 화면의 반응성을 유지합니다.

<p align="center">
  <img src="docs/images/banner.jpg" width="960" alt="날쌩마와 가디안을 합친 Rapivoir">
</p>

### 능력치 설정

- **레벨:** 1–100. **개체값:** 0–31, 6개 능력치에 동일하게 적용.
- **성격:** 25가지, 능력치 보정 표시.
- **노력값:** 프리셋 또는 직접 배분. 능력치별 최대 252, 총합 최대 510이며 프리셋은 최대 508 배분.
- **특성:** 양쪽에서 상속하는 기본 특성 선택. 불가사의부적의 HP 규칙 반영.
- **비교:** 실제 능력치에만 변화량을 표시합니다. 성격 변경은 다른 조건이 같은 무보정 성격 대비 현재 보정량을, 숫자 변경은 이번 입력 전과의 차이를 표시합니다. 직접 고정한 기준과의 비교는 별도로 명시합니다. 포켓몬을 바꾸면 이전 비교값과 고정 기준을 초기화합니다. 여러 자리 숫자 입력은 하나의 변경으로 취급합니다.

각 설정 아래에 계산에 반영되는 요소를 표시합니다. 실제 능력치 합계와 종족값 합계를 구분하고, 계산 내역에서 노력값 버림·레벨 보정·성격 배율·특수 HP 규칙을 확인할 수 있습니다.

레벨·개체값은 숫자를 직접 입력할 수 있습니다. 다른 드롭다운은 텍스트로 검색할 수 있고, 화살표 버튼을 누르면 선택 전용 목록이 열립니다. 언어 드롭다운은 선택 전용입니다.

북마크와 마지막으로 본 퓨전은 `localStorage`에 저장됩니다. 해당 브라우저와 사이트 주소에만 보관되며 기기 간 동기화는 지원하지 않습니다. 저장된 열람 정보가 없거나 저장 권한이 거부되면 첫 방문에 무작위 퓨전을 보여줍니다. 공유 링크의 지정값이 우선합니다. 사이트 데이터를 삭제하면 저장 정보도 사라집니다.

계산 규칙은 스프라이트 변형 위에 항상 표시됩니다. 하단에는 GitHub와 버그 리포트·피드백 이슈 링크가 있습니다.

포켓몬 선택기를 닫고 다시 열어도 타입·세대·정렬·전설 필터가 유지되며, 머리와 몸통 선택 사이에도 공유됩니다. 필터 설정은 해당 브라우저에 보관합니다.

## 트리플 퓨전

트리플 퓨전 탭에서 **공식 조합 23개**를 볼 수 있습니다. 외부 게임 DB에 저장된 전용 종족값·타입·특성과 공식 스프라이트를 사용하며, 데이터가 없는 임의의 세 마리 조합을 생성하지 않습니다. 레벨·개체값·노력값·성격 계산과 저장, 공유 링크, 뒤로가기, 마지막 열람 복원을 지원합니다.

기본 데이터를 갱신한 뒤 `npm run sync-triples`로 트리플 스냅샷을 갱신할 수 있습니다. 출처 URL과 SHA-256은 `public/data/triples.json`에 기록됩니다.

## 검색

태그 옆의 검색 가능한 **아티스트** 선택기로 제작자를 고를 수 있습니다. 아티스트·태그·기본/확인 불가 조건은 같은 스프라이트에 함께 적용되며, 공동 제작자도 각각 검색됩니다. 고급 검색에서는 `artist:"daz1610" AND atk:>=80`처럼 영문 필드 키를 사용합니다.

### 일반 검색

포켓몬 이름 또는 퓨전 ID를 입력하세요. 입력을 멈춘 뒤 **220ms** 후 결과가 갱신되며, 한글 조합 중에는 검색을 기다립니다. 대기 중인 검색은 최신 입력으로 대체됩니다.

**공백 또는 쉼표**로 단어를 나누면 모든 단어를 포함하는 퓨전을 찾습니다.

```text
피카츄 이상해씨
피카츄, 이상해씨
25.1
```

앞의 두 검색은 머리·몸통 순서가 다른 두 조합을 찾습니다. 부분 이름이나 서로 다른 지원 언어의 이름을 조합할 수도 있습니다. 한국어 설정에서는 [hansearch](https://github.com/hwantage/hansearch)를 사용해 `ㅍㅋㅊ ㅇㅅㅎㅆ`처럼 초성·혼합 한글 입력도 지원합니다.

일반 검색과 고급 검색의 입력·적용 조건은 따로 보관됩니다. 일반 검색에서는 필드 검색식을 일반 텍스트로 취급합니다.

### 고급 검색

**고급 검색**에서는 여러 줄 입력과 구문 강조를 사용할 수 있습니다. **검색 적용** 또는 **Ctrl/Cmd + Enter**로 실행하세요. 사이트의 **검색 문법**에서 예시도 확인할 수 있습니다.

```text
(type:fire OR type:poison)
AND atk:>=80
AND bst:>450
```

| 검색식 | 의미 |
| --- | --- |
| `피카츄` 또는 `name:"리자몽"` | 머리·몸통 포켓몬의 이름 또는 퓨전 이름 검색. |
| `type:poison` 또는 `type:독` | 퓨전 타입 검색. 번역된 타입 이름도 사용 가능. |
| `atk:21` | 공격 종족값이 정확히 21. |
| `hp:>=100 AND spe:>80` | 수치 조건 결합. |
| `head:6 body:94` 또는 `id:6.94` | **Infinite Fusion ID**로 머리·몸통·조합 지정. |
| `tag:reference` | 공식 스프라이트 태그 검색. |
| `artist:"sample artist"` | 제작자 검색. 값에 공백이 있으면 큰따옴표 사용. |
| `NOT type:water` 또는 `type:!=water` | 특정 타입 제외. |
| `custom:false` | 자동 생성 스프라이트 검색. **커스텀만** 필터도 해제해야 함. |

연산자는 대소문자를 구분하지 않습니다. 우선순위는 `NOT` → `AND` → `OR`이며 괄호로 변경할 수 있습니다. 조건 사이의 공백과 줄바꿈은 `AND`로 처리합니다. 수치 필드 `hp`, `atk`, `def`, `spa`, `spd`, `spe`, `bst`는 모두 **종족값**을 의미합니다. 비교 연산자는 `=`, `!=`, `>`, `<`, `>=`, `<=`를 지원합니다.

알 수 없는 필드, 잘못된 숫자·타입, 짝이 맞지 않는 괄호는 오류로 표시됩니다. 각 조합은 조건에 맞는 스프라이트 하나로 표시됩니다. 태그·제작자 조건은 해당 스프라이트에 적용되며, 실험실에서 그 조합의 변형을 확인할 수 있습니다.

## 로컬 실행

**Node.js 22 이상**이 필요합니다. 별도로 설치할 npm 패키지는 없습니다.

```sh
npm run dev
```

[localhost:5173](http://127.0.0.1:5173)을 여세요.

| 명령어 | 용도 |
| --- | --- |
| `npm test` | 계산·검색·데이터 파서·로컬 서버 테스트. |
| `npm run verify-data` | 가져온 데이터 스냅샷 검증. |
| `npm run build` | `dist/`에 정적 사이트 빌드. |
| `npm run sync-data` | 외부 데이터 갱신. 네트워크 연결 필요. |

UI는 네이티브 ES 모듈·HTML·CSS로 구현했습니다. `public/data/`에는 외부 DB에서 가져온 스냅샷을 보관합니다. 스프라이트는 공식 게임 저장소에서 불러오므로 이미지 표시에는 인터넷 연결이 필요합니다. 데이터 요청에 실패하면 오류와 재시도 기능을 제공합니다.

## GitHub Pages 배포

1. 저장소의 **Settings → Pages → Build and deployment**에서 **Source**를 **GitHub Actions**로 선택합니다.
2. `main`에 푸시하면 포함된 [워크플로](.github/workflows/pages.yml)가 테스트·데이터 검증·빌드를 수행하고 `dist/`를 배포합니다. Actions에서 수동 실행할 수도 있습니다.
3. 배포 주소는 워크플로의 `github-pages` 환경에서 확인합니다.

루트 도메인과 `https://username.github.io/Pokemon-Fusion-Viewer/` 같은 프로젝트 하위 경로를 모두 지원합니다. 별도 배포 토큰은 필요하지 않습니다. 배포에는 커밋된 데이터 스냅샷을 사용하므로, 갱신하려면 `npm run sync-data` 실행 결과를 커밋하세요.

## 데이터와 계산

**지원 범위는 공식 공개 Infinite Fusion e18 DB의 기본 포켓몬 501종입니다.** 특정 시점의 데이터 스냅샷이므로 최신 Hoenn 릴리스와 차이가 있을 수 있습니다. 사이트의 **데이터 출처**에서 범위와 갱신일을 확인할 수 있습니다.

| 데이터 | 출처 |
| --- | --- |
| 게임 ID·종족값·타입·폼 | [공식 e18 species.dat](https://github.com/infinitefusion/infinitefusion-e18/blob/main/Data/species.dat) |
| 번역 이름·성격·타입·특성·분류 | [PokeAPI CSV DB](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv) |
| 기본·커스텀 스프라이트 | [공식 스프라이트 시트](https://github.com/infinitefusion/infinitefusion-hoenn-public/tree/main/Graphics/CustomBattlers/spritesheets) |
| 자동 생성 퓨전 | [공식 자동 생성 시트](https://github.com/infinitefusion/infinitefusion-hoenn-public/tree/main/Graphics/Battlers/spritesheets_autogen) |
| 공식 인게임 스프라이트 목록 | [CUSTOM_SPRITES](https://github.com/infinitefusion/infinitefusion-hoenn-public/blob/main/Data/sprites/CUSTOM_SPRITES) |
| 태그·제작자 정보 | [공식 Sprite Credits.csv](https://github.com/infinitefusion/infinitefusion-hoenn-public/blob/main/Data/sprites/Sprite%20Credits.csv) |
| 퓨전 이름 | [공식 SplitNames.rb](https://github.com/infinitefusion/scripts/blob/main/052_InfiniteFusion/Fusion/Data/SplitNames.rb) |
| 계산 규칙 | [공식 FusedSpecies.rb](https://github.com/infinitefusion/scripts/blob/main/052_InfiniteFusion/Fusion/Data/FusedSpecies.rb) |

### 도감 분류

도감은 현재 공식 스프라이트 목록을 기준으로 **기본 도감** / **인게임 확인 불가**로 분류합니다. 목록에 있으면 `main`·`alt`·`temp` 상태에 관계없이 기본·선택 가능한 대체 이미지를 모두 인게임에 포함합니다. 목록에 없는 이미지는 확인 불가 분류와 해당 태그 집계에만 포함하며, 미사용으로 단정하지 않습니다. 설치한 게임 버전에 따라 차이가 있을 수 있고 수동 설치는 별개입니다. 자동 스프라이트 선택은 기존처럼 목록에 있는 main을 우선하고, 없으면 temp를 사용합니다. 전체 퓨전 수는 고유한 머리 × 몸통 조합 수입니다.

### 퓨전 능력치

- **HP·특수공격·특수방어:** 머리 ⅔ + 몸통 ⅓.
- **공격·방어·스피드:** 몸통 ⅔ + 머리 ⅓.
- 게임 코드와 동일하게 **각 항을 따로 버림**합니다. 그다음 레벨·개체값·노력값·성격을 반영해 실제 능력치를 계산합니다.

<details>
<summary><strong>데이터 가져오기 상세</strong></summary>

`catalog.json`의 metadata에는 갱신일, 원본 URL, SHA-256 해시를 기록합니다. Ruby Marshal 게임 데이터는 실행하지 않고 데이터로만 해석합니다. 전국도감 번호는 번역을 연결하고, Infinite Fusion ID는 퓨전 조합과 스프라이트 조회에 사용합니다.

원본 폼 중에는 번역 이름이 중복되는 경우가 있어 선택기에 원본 식별자도 표시합니다. 제작자 목록과 공개 이미지 목록을 대조하고, 이미지 파일이 없는 변형은 검색 인덱스에서 제외합니다.

</details>

## 검색 노출 및 공유

Pages 빌드 시 지원하는 머리·몸통 조합과 공식 트리플의 검색용 페이지, 분할 사이트맵, 대표 URL·제목·요약문, 실제 사이트 스크린샷 미리보기와 아이콘을 생성합니다. 개인 저장 목록과 필터 조합은 사이트맵에 넣지 않습니다.

Search Console·Bing·네이버 등록, 소유 확인, 프로젝트 사이트의 robots.txt 제약과 이미지 수정 방법은 [검색 설정 안내](docs/SEO.ko.md)를 참고하세요. 실제 색인 여부와 검색 결과의 문구·이미지는 검색엔진이 결정합니다.

## Pokémon Infinite Fusion에 기여하기

Pokémon Infinite Fusion은 여러 기여자들이 있기 때문에 가능한 프로젝트입니다! 스프라이트를 직접 추가하고 도감 설명을 작성하는 등 Pokémon Infinite Fusion에 직접 기여해 주세요. [공식 디스코드 커뮤니티 ↗](https://discord.gg/infinitefusion)

<sub>* Pokémon Infinite Fusion은 AI기여를 금지합니다.</sub>

이곳에 없는 기능은 다음 사이트를 참고해주세요. [FusionDex](https://fusiondex.org/) · [Infinite Dex](https://infinitefusiondex.com/)

## 크레딧

한국어 검색은 **[hwantage/hansearch](https://github.com/hwantage/hansearch)**를 [MIT 라이선스](src/vendor/hansearch.LICENSE.txt)로 사용합니다. 원본 알고리즘은 유지하고 UMD 래퍼만 ES 모듈로 변경했습니다. 원본 리비전과 저작권 고지도 함께 보관합니다.

퓨전 배너에는 공식 날쌩마·가디안 스프라이트와 **simply_mei**가 제작한 **Rapivoir (#78.287)**를 사용했습니다. [공식 스프라이트 시트](https://raw.githubusercontent.com/infinitefusion/infinitefusion-hoenn-public/main/Graphics/CustomBattlers/spritesheets/spritesheets_custom/78/78.png)에서 가져왔습니다.

스프라이트의 권리는 각 제작자에게 있습니다. Pokémon © Nintendo / Creatures / GAME FREAK. Fusion Viewer는 비공식 팬 도구입니다.

---

<p align="center">
  <a href="https://dominokorean.github.io/Pokemon-Fusion-Viewer/"><strong>사이트 바로가기 ↗</strong></a>
</p>
