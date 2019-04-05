`Access-Control-Allow-Origin: *`は危険であることを言いたいリポジトリ
===========================

実際にサーバを置くわけにもいかないので、簡単に再現できるコードを用意しました。


前準備
---------------------

まず、Hostsに以下を追記し、3つのドメインでブラウザからローカルのサーバへアクセスできるようにします。

```
127.0.0.1 myapp.example
127.0.0.1 trust.example
127.0.0.1 evil.example
```

ローカルにサーバを立ち上げます。Nodejsが必要です。(server.js編集後は再起動が必要)

```
npm install
DEBUG=http,express:* node server.js
```

利用
-------------------------

myapp.exampleはブラウザから利用できるHello APIを提供しようと考えています。
このAPIを利用するためには`POST`メソッドを使う事と、特別なヘッダ`Hello`を付与する必要があります。

各サイトからAPIを利用してみてください。evil.exampleは攻撃者が用意した罠ページです。

- http://myapp.example
    - Cross Originではないので、CORSの制約を受けません。Hello APIを利用できます
- http://trust.example
    - Cross Originですが、myapp.exampleが信用しているサイトなので、Hello APIを利用できます
- http://evil.example/
    - Cross Originで信頼していないため、Hello APIを利用できません


evilが用意した罠サイトは以下です。ボタンを押すとボタンを再度推すまでAPIを利用し続けます。

http://evil.example/evil.html

server.jsはデフォルトはOriginを考慮するため、プリフライトリクエストが大量に飛ぶものの、APIのアクセスまでには至りません。

次に、server.jsのコメントアウト箇所を戻し、`Access-Control-Allow-Origin: *`を返すようにします。その後、nodeを再起動してください。

再度、罠サイトを開き、ボタンを押してください。今度はリクエストが飛び続けるはずです。

### 評価

この手法には他にはないメリットがあります。

- XSS探しをせずに罠ページを踏ませるだけでよく、準備が簡単
- リクエスト時は罠サイトを開いた人(被害者)のIPで大量にリクエストを送ることになる
- API提供側はOriginヘッダをログに残さないと証跡が残らない（被害者が攻撃してきているように見える）

なので一定時間だけ罠サイトを公開して閉じれば、後は各被害者のマシン上の履歴にしか残りません。（ISPがログを取っていた場合、IPベースで検知できるかもしれません。）


### 対処

CORSの仕組みである`Access-Control-Allow-Origin`ヘッダを適切に返せばこの攻撃は大量のプリフライトリクエストのみになり、負荷は半減します。

ぜひ適切に設定してください。


### 付録: 

以下は`Access-Control-Allow-Origin`の設定時の利用可能な状態一覧です。

|                     |`*` | ` http://myapp.example `| ` http://trust.example `|
|---------------------|-----|-----|-----|
|http://myapp.example | ○ | ○ | × |
|http://trust.example | ○ | × | ○ |
|http://evil.example | ○ | × | × |

`Access-Control-Allow-Origin`ヘッダは1個の情報しか返せないため、CrossOriginに公開する場合はサーバ側でOriginヘッダを判断する処理が必要です。