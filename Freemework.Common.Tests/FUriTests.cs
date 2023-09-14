namespace Freemework.Common.Tests
{
	using Xunit;

	using Freemework.Common;

	public class FUriTests
	{
		[Fact]
		public void Test_04_parse_https()
		{
			FUri uri = FUri.Parse("https://docs.freemework.org/Freemework.Common/FUrl/#static-methods");
			//Assert.True(uri.IsScheme("https"));
			//Assert.Equal("https", uri.Scheme);
			Assert.Equal("docs.freemework.org", uri.Host);
			Assert.Equal("docs.freemework.org", uri.Authority);
			Assert.Equal<ushort?>(443, uri.Port);
			Assert.Equal("/Freemework.Common/FUrl/", uri.Path);
			// Assert.Equal(["Freemework.Common", "FUrl"], uri.PathSegments);
			//Assert.Equal("static-methods", uri.Fragment);
			Assert.False(uri.HasQuery);
		}

		// [Theory]
		// [InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "docs.freemework.org")]
		// [InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", "docs.freemework.org:80")]
		// [InlineData("http://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", "docs.freemework.org:443")]
		// [InlineData("https://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "docs.freemework.org")]
		// [InlineData("https://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", "docs.freemework.org:80")]
		// [InlineData("https://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", "docs.freemework.org:443")]
		// [InlineData("telnet://192.0.2.16:80/", "192.0.2.16:80")]
		// [InlineData("https://doi.org/10.1007/s11280-020-00849-3", "doi.org")]
		// [InlineData("git://github.com/user/repo.git", "github.com")]
		// [InlineData("ftp://ftp.example.org/", "ftp.example.org")]
		// [InlineData("ldap://ldap.example.com/dc=example,dc=com", "ldap.example.com")]
		// public void Test_Authority(string absoluteUriString, string expectedAuthority)
		// {
		// 	FUri uri = FUri.Parse(absoluteUriString);

		// 	Assert.Equal(expectedAuthority, uri.Authority);
		// }

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "#static-methods")]
		[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", "#static-methods")]
		[InlineData("https://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", "#static-methods")]
		public void Test_Fragment(string absoluteUriString, string expectedFragment)
		{
			FUri uri = FUri.Parse(absoluteUriString);

			Assert.Equal(expectedFragment, uri.Fragment);
		}

		[Theory]
		[InlineData("https://learn.microsoft.com/en-us/dotnet/api/system.uri.query?view=net-7.0#system-uri-query", "?view=net-7.0")]
		[InlineData("https://translate.google.com/?hl=ru&sl=en&tl=ru&op=translate", "?hl=ru&sl=en&tl=ru&op=translate")]
		public void Test_Query(string absoluteUriString, string expectedQuery)
		{
			FUri uri = FUri.Parse(absoluteUriString);

			Assert.Equal(expectedQuery, uri.Query);
		}
		
		[Theory]
		[InlineData("ftp://username:password@ftp.example.com/", "username:password")]
		public void Test_UserInfo(string absoluteUriString, string expectedUserInfo)
		{
			FUri uri = FUri.Parse(absoluteUriString);

			Assert.Equal(expectedUserInfo, uri.UserInfo);
		}

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "http")]
		[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", "http")]
		[InlineData("http://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", "http")]
		[InlineData("https://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "https")]
		[InlineData("https://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", "https")]
		
		public void Test_Scheme(string absoluteUriString, string expectedScheme)
		{
			FUri uri = FUri.Parse(absoluteUriString);

			Assert.Equal(expectedScheme, uri.Scheme);
		}

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "docs.freemework.org")]
		[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", "docs.freemework.org")]
		[InlineData("git://github.com/user/repo.git", "github.com")]
		public void Test_Host(string absoluteUriString, string expectedHost)
		{
			FUri uri = FUri.Parse(absoluteUriString);

			Assert.Equal(expectedHost, uri.Host);
		}

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "/Freemework.Common/FUrl/")]
		[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", "/Freemework.Common/FUrl/")]
		[InlineData("git://github.com/user/repo.git", "/user/repo.git")]
		public void Test_Path(string absoluteUriString, string expectedPath)
		{
			FUri uri = FUri.Parse(absoluteUriString);

			Assert.Equal(expectedPath, uri.Path);
		}

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", true)]
		[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", true)]
		
		public void Test_HasAuthority(string absoluteUriString, bool expectedResult)
		{
        	FUri uri = FUri.Parse(absoluteUriString);

        	bool actualResult = !string.IsNullOrEmpty(uri.Authority);

        	Assert.Equal(expectedResult, actualResult);
    	}

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", true)]
		[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", true)]
		
		public void Test_HasFragment(string absoluteUriString, bool expectedResult)
		{
        	FUri uri = FUri.Parse(absoluteUriString);

        	bool actualResult = !string.IsNullOrEmpty(uri.Fragment);

        	Assert.Equal(expectedResult, actualResult);
    	}

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", false)]
		[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", false)]
		[InlineData("https://learn.microsoft.com/en-us/dotnet/api/system.uri.query?view=net-7.0#system-uri-query", true)]
		[InlineData("https://translate.google.com/?hl=ru&sl=en&tl=ru&op=translate", true)]
		[InlineData("git://github.com/user/repo.git", false)]
		public void Test_HasQuery(string absoluteUriString, bool expectedResult)
		{
        	FUri uri = FUri.Parse(absoluteUriString);

        	bool actualResult = !string.IsNullOrEmpty(uri.Query);

        	Assert.Equal(expectedResult, actualResult);
    	}

		[Theory]
		[InlineData("https://learn.microsoft.com/en-us/dotnet/api/system.uri.query?view=net-7.0#system-uri-query", true)]
		[InlineData("https://translate.google.com/?hl=ru&sl=en&tl=ru&op=translate", true)]
		[InlineData("git://github.com/user/repo.git", true)]
		public void Test_HasScheme(string absoluteUriString, bool expectedResult)
		{
        	FUri uri = FUri.Parse(absoluteUriString);

        	bool actualResult = !string.IsNullOrEmpty(uri.Scheme);

        	Assert.Equal(expectedResult, actualResult);
    	}

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "http://docs.freemework.org")]
		public void Test_Origin(string absoluteUriString, string expectedOrigin)
		{
			FUri uri = FUri.Parse(absoluteUriString);

			Assert.Equal(expectedOrigin, uri.Origin);
		}

		// [Theory]
		// [InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", false)]
		// [InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", true)]
		// [InlineData("http://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", true)]
		// [InlineData("https://docs.freemework.org/Freemework.Common/FUrl/#static-methods", false)]
		// [InlineData("https://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", true)]
		// [InlineData("https://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", true)]
		// public void Test_HasPort(string absoluteUriString, bool expectedResult)
		// {
        // 	FUri uri = FUri.Parse(absoluteUriString);

		// 	if(expectedResult)
		// 	{
		// 		Assert.True(uri.HasPort);
		// 	}
		// 	else 
		// 	{
		// 		Assert.False(uri.HasPort);
		// 	}
    	// }

		//[Theory]
		//[InlineData("urn:oasis:names:specification:docbook:dtd:xml:4.1.2", null)]
		//[InlineData("telnet://192.0.2.16:80/", (ushort)80)]
		//[InlineData("news:comp.infosystems.www.servers.unix", null)]
		//[InlineData("mailto:John.Doe@example.com", null)]
		//[InlineData("tel:+1-816-555-1212", null)]
		//[InlineData("ldap://ldap.freemework.org", null)]
		//[InlineData("ldap://ldap.freemework.org:389", (ushort)389)]
		//[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", null)]
		//[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", (ushort)80)]
		//[InlineData("http://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", (ushort)443)]
		//[InlineData("https://docs.freemework.org/Freemework.Common/FUrl/#static-methods", null)]
		//[InlineData("https://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", (ushort)80)]
		//[InlineData("https://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", (ushort)443)]
		//public void Test_Port(string absoluteUriString, ushort? expectedPort)
		//{
			//FUri uri = FUri.Parse(absoluteUriString);

			//if (expectedPort == null)
			//{
				//Assert.Null(uri.Port);
			//}
			//else
			//{
				//Assert.Equal(expectedPort, uri.Port);
			//}
		//}
	}
}