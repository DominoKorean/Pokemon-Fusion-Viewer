<div align="center">

<img src="docs/images/website-preview.jpg" width="960" alt="レジギガスとウルガモスのフュージョンスプライトと能力値を表示するFusion Viewerの画面">

<h1>Fusion Viewer</h1>

<p><a href="README.md">English</a> &nbsp; · &nbsp; <a href="README.ko.md">한국어</a> &nbsp; · &nbsp; <strong>日本語</strong></p>

<p><strong>モバイル最適化 · 能力値の変化を確認 · 簡単検索</strong></p>

<p>Pokémon Infinite Fusionのスプライトと能力値をコンパクトに確認できるビューアー。<br>サイトの初期言語は英語で、韓国語と日本語にも対応しています。</p>

<p>
  <a href="https://dominokorean.github.io/Pokemon-Fusion-Viewer/"><strong>Fusion Viewerを開く ↗</strong></a>
  &nbsp; · &nbsp;
  <a href="#機能">機能</a>
  &nbsp; · &nbsp;
  <a href="#検索">検索ガイド</a>
  &nbsp; · &nbsp;
  <a href="#ローカルで実行">ローカルで実行</a>
</p>

</div>

## 機能

| | できること |
| --- | --- |
| **フュージョンラボ** | 頭と体を選択し、それぞれのランダム選択・入れ替え・逆向きのフュージョンとの比較。ブラウザーの戻る・進むで以前の組み合わせと画像を復元。 |
| **スプライト** | 作者情報付きの公式カスタム画像を閲覧。カスタムがない場合は自動生成画像を表示。 |
| **能力値** | レベル・性格・個体値・努力値・継承特性を設定し、種族値と実際の能力値を比較。 |
| **フュージョン図鑑** | タイプ・スプライトタグで絞り込み、並べ替え、ページ番号の直接入力で移動。 |
| **検索** | 入力に応じた検索、複数の名前の組み合わせ、構文強調付きの複数行詳細検索。 |
| **保存・共有** | ブラウザーにフュージョンをブックマークし、選択した組み合わせと画像のリンクをコピー。 |
| **言語** | 英語・韓国語・日本語を切り替え、選択した言語を保存。 |

小さな画面でも多くの情報を見られるよう、操作部とカードをコンパクトに配置しています。ポケモン選択画面は結果数にかかわらず検索・フィルターの位置を固定し、結果だけをスクロールします。小さな画像は滑らかに縮小表示します。スプライトは必要に応じて読み込み、図鑑検索はWeb Workerで処理して画面の応答性を保ちます。

<p align="center">
  <img src="docs/images/banner.jpg" width="960" alt="ギャロップとサーナイトをフュージョンしたRapivoir">
</p>

### 能力値の設定

- **レベル:** 1–100。**個体値:** 0–31、全6能力に同じ値を適用。
- **性格:** 25種類。能力値の補正を表示。
- **努力値:** プリセットまたは直接配分。各能力は最大252、合計は最大510。プリセットは最大508を配分。
- **特性:** 継承する基本特性を選択。ふしぎなまもりのHPルールにも対応。
- **比較:** 実際の能力値にだけ差分を表示します。性格変更では他の条件が同じ無補正の性格との差を、数値入力では今回の入力前との差を表示します。明示的に固定した基準との比較は別に表示します。ポケモンを変更すると直前・固定の比較基準をリセットします。複数桁の入力は1回の変更として扱います。

各設定の下に計算への影響を表示します。実際の能力値合計と種族値合計を区別し、内訳では努力値の切り捨て・レベル補正・性格倍率・特殊なHPルールを確認できます。

レベルと個体値は数値を直接入力できます。他のドロップダウンではテキストで検索でき、矢印ボタンを押すと選択専用の一覧が開きます。言語のドロップダウンは選択専用です。

ブックマークと最後に見たフュージョンは`localStorage`に保存されます。そのブラウザーとサイトのオリジンにのみ保存され、端末間では同期されません。閲覧情報がない場合や保存が拒否された場合、初回アクセスではランダムなフュージョンを表示します。共有リンクの指定が優先されます。サイトデータを削除すると保存情報も消えます。

計算規則はスプライトのバリエーションの上に常時表示します。フッターにGitHubと不具合報告・フィードバック用のIssueリンクがあります。

選択画面を閉じてもタイプ・世代・並び順・伝説フィルターを保持し、頭と体の選択で共有します。設定はそのブラウザーに保存します。

## トリプルフュージョン

トリプルフュージョンタブで**公式の組み合わせ23種類**を閲覧できます。外部ゲームDBの専用種族値・タイプ・特性と公式スプライトを使用し、データのない任意の3匹の組み合わせは生成しません。レベル・個体値・努力値・性格の計算、保存、共有リンク、履歴、最後に見たフュージョンの復元に対応しています。

基本データの更新後、`npm run sync-triples`でトリプルのスナップショットを更新できます。出典URLとSHA-256は`public/data/triples.json`に記録します。

## 検索

タグの隣にある検索可能な**制作者**選択でアーティストを指定できます。制作者・タグ・確認状況は同じスプライトに適用され、共同制作者も個別に検索できます。詳細検索では`artist:"daz1610" AND atk:>=80`のように英語のキーを使います。

### 通常検索

ポケモン名またはフュージョンIDを入力してください。入力が止まってから**220ms**後に結果が更新されます。待機中の検索は最新の入力に置き換えます。

**空白またはカンマ**で区切ると、すべての語を含むフュージョンを検索します。

```text
ピカチュウ フシギダネ
ピカチュウ, フシギダネ
25.1
```

最初の2つの検索は、頭と体の順序が異なる両方の組み合わせを探します。名前の一部や、異なる対応言語の名前も組み合わせられます。

通常検索と詳細検索は、入力内容と適用済みの条件を別々に保持します。通常検索ではフィールド検索式を通常のテキストとして扱います。

### 詳細検索

**詳細検索**では複数行入力と構文強調を利用できます。**検索する**または**Ctrl/Cmd + Enter**で実行してください。サイト内の**検索ガイド**には使用例もあります。

```text
(type:fire OR type:poison)
AND atk:>=80
AND bst:>450
```

| 検索式 | 意味 |
| --- | --- |
| `ピカチュウ`または`name:"リザードン"` | 頭・体のポケモン名、またはフュージョン名を検索。 |
| `type:poison`または`type:どく` | フュージョンのタイプを検索。翻訳されたタイプ名も使用可能。 |
| `atk:21` | こうげきの種族値がちょうど21。 |
| `hp:>=100 AND spe:>80` | 数値条件を組み合わせる。 |
| `head:6 body:94`または`id:6.94` | **Infinite Fusion ID**で頭・体・組み合わせを指定。 |
| `tag:reference` | 公式スプライトタグを検索。 |
| `artist:"sample artist"` | 作者を検索。空白を含む値は二重引用符で囲む。 |
| `NOT type:water`または`type:!=water` | 特定のタイプを除外。 |
| `custom:false` | 自動生成スプライトを検索。**カスタムのみ**の絞り込みも解除する必要あり。 |

演算子は大文字・小文字を区別しません。優先順位は`NOT` → `AND` → `OR`で、括弧で変更できます。条件間の空白と改行は`AND`として扱います。数値フィールド`hp`、`atk`、`def`、`spa`、`spd`、`spe`、`bst`はすべて**種族値**を指します。比較演算子は`=`、`!=`、`>`、`<`、`>=`、`<=`に対応しています。

不明なフィールド、不正な数値・タイプ、対応しない括弧はエラーになります。各組み合わせには条件に一致するスプライトを1つ表示します。タグと作者の条件はそのスプライトに適用されます。ラボを開くと、その組み合わせのバリエーションを確認できます。

## ローカルで実行

**Node.js 22以上**が必要です。別途インストールするnpmパッケージはありません。

```sh
npm run dev
```

[localhost:5173](http://127.0.0.1:5173)を開いてください。

| コマンド | 用途 |
| --- | --- |
| `npm test` | 計算・検索・データ解析・ローカルサーバーのテスト。 |
| `npm run verify-data` | インポート済みデータのスナップショットを検証。 |
| `npm run build` | 静的サイトを`dist/`にビルド。 |
| `npm run sync-data` | 外部データを更新。ネットワーク接続が必要。 |

UIはネイティブESモジュール・HTML・CSSで実装しています。`public/data/`には外部データベースから取得したスナップショットを保存します。スプライトは公式ゲームリポジトリから読み込むため、画像の表示にはインターネット接続が必要です。データ取得に失敗するとエラーと再試行の操作を表示します。

## GitHub Pagesへのデプロイ

1. リポジトリの**Settings → Pages → Build and deployment**で、**Source**を**GitHub Actions**に設定します。
2. `main`にプッシュすると、付属の[ワークフロー](.github/workflows/pages.yml)がテスト・データ検証・ビルドを実行し、`dist/`をデプロイします。Actionsから手動実行することもできます。
3. 公開URLはワークフローの`github-pages`環境で確認できます。

ルートドメインと`https://username.github.io/Pokemon-Fusion-Viewer/`のようなプロジェクトのサブパスに対応しています。別途デプロイトークンは不要です。デプロイにはコミット済みのスナップショットを使用するため、データを更新するときは`npm run sync-data`の実行結果をコミットしてください。

## データと計算

**対応範囲は公式公開Infinite Fusion e18データベースの基本ポケモン501種です。** 特定時点のスナップショットのため、最新のHoennリリースとは異なる場合があります。サイトの**データ出典**で対応範囲と取得日を確認できます。

| データ | 出典 |
| --- | --- |
| ゲームID・種族値・タイプ・フォルム | [公式e18 species.dat](https://github.com/infinitefusion/infinitefusion-e18/blob/main/Data/species.dat) |
| 翻訳名・性格・タイプ・特性・分類 | [PokeAPI CSVデータベース](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv) |
| 基本・カスタムスプライト | [公式スプライトシート](https://github.com/infinitefusion/infinitefusion-hoenn-public/tree/main/Graphics/CustomBattlers/spritesheets) |
| 自動生成のフュージョン | [公式自動生成シート](https://github.com/infinitefusion/infinitefusion-hoenn-public/tree/main/Graphics/Battlers/spritesheets_autogen) |
| 公式のゲーム内スプライト一覧 | [CUSTOM_SPRITES](https://github.com/infinitefusion/infinitefusion-hoenn-public/blob/main/Data/sprites/CUSTOM_SPRITES) |
| タグ・作者情報 | [公式Sprite Credits.csv](https://github.com/infinitefusion/infinitefusion-hoenn-public/blob/main/Data/sprites/Sprite%20Credits.csv) |
| フュージョン名 | [公式SplitNames.rb](https://github.com/infinitefusion/scripts/blob/main/052_InfiniteFusion/Fusion/Data/SplitNames.rb) |
| 計算ルール | [公式FusedSpecies.rb](https://github.com/infinitefusion/scripts/blob/main/052_InfiniteFusion/Fusion/Data/FusedSpecies.rb) |

### 図鑑の分類

図鑑は現在の公式スプライト一覧を基準に、**基本図鑑** / **ゲーム内確認不可**に分類します。一覧内の画像はmain・alt・tempの状態にかかわらず、標準・選択可能な代替画像を含めます。一覧にない画像は確認不可の分類とそのタグ集計にのみ含め、未使用とは断定しません。インストールしたゲームのバージョンによって異なる場合があり、手動インストールとは別の扱いです。自動選択は従来どおり一覧内のmainを優先し、なければtempを使用します。フュージョンの総数は固有の頭 × 体の組み合わせ数です。

### フュージョンの能力値

- **HP・とくこう・とくぼう:** 頭⅔ + 体⅓。
- **こうげき・ぼうぎょ・すばやさ:** 体⅔ + 頭⅓。
- ゲームのコードと同じく、**各項を個別に切り捨て**ます。その後、レベル・個体値・努力値・性格を反映して実際の能力値を計算します。

<details>
<summary><strong>データのインポートについて</strong></summary>

`catalog.json`のmetadataには取得日、元のURL、SHA-256ハッシュを記録します。Ruby Marshal形式のゲームデータは実行せず、データとしてのみ解析します。全国図鑑番号は翻訳の対応付けに、Infinite Fusion IDはフュージョンの組み合わせとスプライトの参照に使用します。

元のフォルムには翻訳名が重複するものもあるため、選択画面には元の識別子も表示します。作者情報と公開画像の一覧を照合し、画像ファイルが存在しないバリエーションは検索インデックスから除外します。

</details>

## Pokémon Infinite Fusionに貢献する

Pokémon Infinite Fusionは、多くの貢献者に支えられて成り立つプロジェクトです！スプライトの追加や図鑑説明文の執筆などを通じて、ぜひPokémon Infinite Fusionに直接貢献してください。 [公式Discordコミュニティ ↗](https://discord.gg/infinitefusion)

<sub>* Pokémon Infinite FusionではAIによる貢献は禁止されています。</sub>

ここにない機能については、以下のサイトをご覧ください。 [FusionDex](https://fusiondex.org/) · [Infinite Dex](https://infinitefusiondex.com/)

## クレジット

韓国語検索には **[hwantage/hansearch](https://github.com/hwantage/hansearch)** を[MITライセンス](src/vendor/hansearch.LICENSE.txt)で使用しています。元のアルゴリズムは維持し、UMDラッパーのみをESモジュールに変更しています。元のリビジョンと著作権表示も同梱しています。

フュージョンバナーには公式のギャロップ・サーナイトのスプライトと、**simply_mei**制作の**Rapivoir (#78.287)**を使用しています。[公式スプライトシート](https://raw.githubusercontent.com/infinitefusion/infinitefusion-hoenn-public/main/Graphics/CustomBattlers/spritesheets/spritesheets_custom/78/78.png)から取得しました。

スプライトの権利は各作者に帰属します。Pokémon © Nintendo / Creatures / GAME FREAK。Fusion Viewerは非公式のファンツールです。

---

<p align="center">
  <a href="https://dominokorean.github.io/Pokemon-Fusion-Viewer/"><strong>Fusion Viewerを開く ↗</strong></a>
</p>
