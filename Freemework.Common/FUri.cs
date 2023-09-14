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

        public bool HasAuthority
        {
            get
            {
                return this._wrap.Authority != "";
            }
        }

        public string Fragment 
        { 
            get 
            {
                return this._wrap.Fragment;

            } 
        }

        public string Query
        {
            get
            {
                return this._wrap.Query;
            }
        }

        public bool HasQuery
        {
            get
            {
                return this._wrap.Query != "";
            }
        }

        public bool HasFragment
        {
            get
            {
                return this._wrap.Fragment != "";
            }
        }

        public bool HasPort
        {
            get
            {


                // this._wrap.Port;
                return false;
            }
        }

        public bool HasScheme
        {
            get
            {
                return this._wrap.Scheme != "";
            }
        }

        public string Host
        {
            get
            {
                return this._wrap.Host;
            }
        }

        public string Scheme
        {
            get
            {
                return this._wrap.Scheme;
            }
        }

        public string Origin
        {
            get
            {
                return $"{this._wrap.Scheme}://{this._wrap.Host}";
            }
        }       


        public string Path
        {
            get
            {
                return this._wrap.AbsolutePath;
            }
        }

        public string UserInfo
        {
            get
            {
                return this._wrap.UserInfo;
            }
        }
        
        public ushort? Port
        {
            get
            {
                if (this._wrap.Port == -1)
                {
                    return null;
                }
                else
                {
                    return (ushort)this._wrap.Port;
                }




                // if (this._wrap.Port == -1 && this._wrap.Port != 80 && this._wrap.Port != 443)
                // {
                //     return (ushort)this._wrap.Port;
                // }
                // else
                // {
                //     return null;
                // }
            }
        }

        private FUri(Uri wrap)
        {
            this._wrap = wrap;
        }
    }
}