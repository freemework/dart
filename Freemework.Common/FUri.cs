namespace Freemework.Common
{
    using InvalidOperationException = System.InvalidOperationException;
    using Uri = System.Uri;

    public class FUri
    {
        private readonly Uri _wrap;

        public static FUri Parse(string absoluteUriString)
        {
            Uri nativeUri = new Uri(absoluteUriString, System.UriKind.Absolute);

            return new FUri(nativeUri);
        }

        public string Authority
        {
            get
            {
                return this._wrap.Authority;
            }
        }

        public bool HasQuery
        {
            get
            {
                return this._wrap.Query != "";
            }
        }

        public string Host
        {
            get
            {
                return this._wrap.Host;
            }
        }

        public string Path
        {
            get
            {
                return this._wrap.AbsolutePath;
            }
        }

        public ushort? Port
        {
            get
            {
                return (ushort)this._wrap.Port;
            }
        }

        private FUri(Uri wrap)
        {
            this._wrap = wrap;
        }
    }
}