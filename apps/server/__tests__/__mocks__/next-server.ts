export class NextResponse extends Response {
  static json(body: unknown, init?: ResponseInit) {
    const status = init?.status ?? 200;
    return new NextResponse(JSON.stringify(body), {
      ...init,
      status,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  }
}

export class NextRequest extends Request {
  public nextUrl: URL;
  constructor(input: string | URL | Request, init?: RequestInit) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    super(url, init);
    this.nextUrl = new URL(url);
  }
}
