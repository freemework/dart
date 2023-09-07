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
			// Assert.True(uri.IsScheme("https"));
			// Assert.Equal("https", uri.Scheme);
			Assert.Equal("docs.freemework.org", uri.Host);
			Assert.Equal("docs.freemework.org", uri.Authority);
			Assert.Equal<ushort?>(443, uri.Port);
			Assert.Equal("/Freemework.Common/FUrl/", uri.Path);
			// Assert.Equal(["Freemework.Common", "FUrl"], uri.PathSegments);
			// Assert.Equal("static-methods", uri.Fragment);
			Assert.False(uri.HasQuery);
		}

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "docs.freemework.org")]
		[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", "docs.freemework.org:80")]
		[InlineData("http://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", "docs.freemework.org:443")]
		[InlineData("https://docs.freemework.org/Freemework.Common/FUrl/#static-methods", "docs.freemework.org")]
		[InlineData("https://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", "docs.freemework.org:80")]
		[InlineData("https://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", "docs.freemework.org:443")]
		public void Test_Authority(string absoluteUriString, string expectedAuthority)
		{
			FUri uri = FUri.Parse(absoluteUriString);

			Assert.Equal(expectedAuthority, uri.Authority);
		}

		[Theory]
		[InlineData("http://docs.freemework.org/Freemework.Common/FUrl/#static-methods", null)]
		[InlineData("http://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", (ushort)80)]
		[InlineData("http://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", (ushort)443)]
		[InlineData("https://docs.freemework.org/Freemework.Common/FUrl/#static-methods", null)]
		[InlineData("https://docs.freemework.org:80/Freemework.Common/FUrl/#static-methods", (ushort)80)]
		[InlineData("https://docs.freemework.org:443/Freemework.Common/FUrl/#static-methods", (ushort)443)]
		public void Test_Port(string absoluteUriString, ushort? expectedPort)
		{
			FUri uri = FUri.Parse(absoluteUriString);

			if (expectedPort == null)
			{
				Assert.Null(uri.Port);
			}
			else
			{
				Assert.Equal(expectedPort, uri.Port);
			}
		}
	}
}