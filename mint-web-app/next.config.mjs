/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: function (config, options) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true,
        };
        return config;
    },
    async rewrites() {

        console.log("Rewrites called")
        return [
            {
                source: "/kupo",
                destination:
                    "https://kupo16gs522exsrd2kg5u2nh.preprod-v2.kupo-m1.demeter.run",
            },
            {
                source: "/ogmios",
                destination:
                    "https://ogmios10y4c4fvjh7hwu8g68fy.preprod-v6.ogmios-m1.demeter.run",
            },
            {
                source: "/kupo-mn/matches/:addr",
                destination:
                    "https://kupo1yzx8y29xf59rccs2guc.mainnet-v2.kupo-m1.demeter.run/matches/:addr?unspent",
            },
            {
                source: "/ogmios-mn/:path*",
                destination:
                    "https://dmtr_ogmios1dfnxks6vfa4h5cn0xpc4v46gf3hnxazxgeqsl3ka7p.mainnet-v6.ogmios-m1.demeter.run/:path*",
            },
        ];
    },
};

export default nextConfig;
