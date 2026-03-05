# 音乐播放器使用说明

将你的 MP3 文件放在这个目录下，博客会自动扫描并添加到播放器中。

## 文件命名格式

推荐使用以下格式命名你的音乐文件：

```
艺术家 - 歌曲名.mp3
```

如果文件名不包含 ` - `，则会显示为：
- 艺术家：Unknown Artist
- 歌曲名：文件名

## 支持的格式

- MP3 (.mp3)
- OGG (.ogg)
- WAV (.wav)
- M4A (.m4a)

## 配置

在 `config.toml` 中可以配置：

```toml
[music]
enabled = true              # 是否启用音乐播放器
music_dir = "static/music"  # 音乐文件目录
autoplay = false            # 是否自动播放
```

## 注意事项

- 音乐文件会被复制到输出目录，请注意文件大小
- 播放器会按文件名排序显示歌曲
- 默认封面使用 `/static/image/bg.jpg`
